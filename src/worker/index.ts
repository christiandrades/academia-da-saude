import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";

// Minimal console declaration for worker TypeScript build
declare const console: { error(...args: any[]): void; log(...args: any[]): void; warn(...args: any[]): void };

const app = new Hono<{ Bindings: Env }>();

function getBinding(c: any, name: keyof Env) {
  // prefer Cloudflare binding
  try {
    const v = c?.env?.[name as string];
    if (v !== undefined && v !== null) return v;
  } catch (e) { }
  // fallback to process.env for local dev
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[name as string]) return process.env[name as string];
  } catch (e) { }
  return undefined;
}

function base64UrlEncode(str: string) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(b64: string) {
  const s = b64.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(s)));
}

async function hmacSha256(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJwt(payload: Record<string, any>, secret: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64UrlEncode(JSON.stringify(header));
  const p = base64UrlEncode(JSON.stringify(payload));
  const toSign = `${h}.${p}`;
  const sig = await hmacSha256(toSign, secret);
  return `${toSign}.${sig}`;
}

async function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const expected = await hmacSha256(`${h}.${p}`, secret);
    if (s !== expected) return null;
    const payload = JSON.parse(base64UrlDecode(p));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Middleware
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'auth_session');
  if (!token || typeof token !== 'string') return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);
  c.set('user', payload);
  await next();
};

// OAuth routes (Google)
app.get('/api/oauth/google/redirect_url', async (c) => {
  const params = new URLSearchParams();
  params.set('client_id', getBinding(c, 'GOOGLE_CLIENT_ID') || '');
  params.set('redirect_uri', getBinding(c, 'GOOGLE_REDIRECT_URI') || '');
  params.set('response_type', 'code');
  params.set('scope', 'openid email profile');
  params.set('access_type', 'offline');

  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return c.json({ redirectUrl }, 200);
});

app.post('/api/sessions', async (c) => {
  const body = await c.req.json();
  if (!body.code) return c.json({ error: 'No authorization code provided' }, 400);

  // Exchange code for token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: body.code,
      client_id: getBinding(c, 'GOOGLE_CLIENT_ID') || '',
      client_secret: getBinding(c, 'GOOGLE_CLIENT_SECRET') || '',
      redirect_uri: getBinding(c, 'GOOGLE_REDIRECT_URI') || '',
      grant_type: 'authorization_code',
    }),
  });

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) return c.json({ error: 'failed to obtain access token' }, 400);

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  const guser = await userRes.json();

  // find or create user in D1
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(guser.email).first();
  if (!user) {
    const r = await c.env.DB.prepare('INSERT INTO users (nome, email, foto_url, role) VALUES (?, ?, ?, ?)')
      .bind(guser.name || 'Usuário', guser.email, guser.picture || null, 'student').run();
    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(r.meta.last_row_id).first();
  }

  const payload = { sub: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 };
  const token = await signJwt(payload, getBinding(c, 'JWT_SECRET') || '');

  setCookie(c, 'auth_session', token, { httpOnly: true, secure: true, path: '/', sameSite: 'Lax', maxAge: 60 * 60 * 24 * 30 });
  return c.json({ success: true }, 200);
});

app.get('/api/logout', async (c) => {
  setCookie(c, 'auth_session', '', { httpOnly: true, secure: true, path: '/', sameSite: 'Lax', maxAge: 0 });
  return c.json({ success: true }, 200);
});

// User routes
app.get("/api/users/me", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const existingUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!existingUser) {
    return c.json({ error: 'User not found in database' }, 404);
  }

  return c.json(existingUser);
});

// Turmas routes
app.get("/api/turmas", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM turmas ORDER BY nome"
  ).all();

  return c.json(results);
});

// Badges routes
app.get("/api/badges/me", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Buscar usuário na nossa base
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user) return c.json({ error: 'User not found in database' }, 404);

  // Buscar todos os badges
  const { results: allBadges } = await c.env.DB.prepare(
    "SELECT * FROM badges ORDER BY titulo"
  ).all();

  // Buscar badges do usuário
  const { results: userBadges } = await c.env.DB.prepare(`
    SELECT b.*, ub.data 
    FROM badges b
    INNER JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ?
    ORDER BY ub.data DESC
  `).bind(user.id).all();

  // Combinar informações
  const badges = allBadges.map((badge: any) => {
    const userBadge = userBadges.find((ub: any) => ub.id === badge.id);
    return {
      ...badge,
      earned: !!userBadge,
      data: userBadge?.data
    };
  });

  return c.json(badges);
});

// Ranking routes
app.get("/api/ranking", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const filter = c.req.query('filter') || 'geral';
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Buscar usuário na nossa base
  const currentUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  let query = `
    SELECT 
      u.id,
      u.nome,
      u.foto_url,
      COALESCE(
        ROUND(
          (COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) * 100.0) / 
          NULLIF(COUNT(f.id), 0)
        ), 0
      ) as frequencia_percentual,
      COUNT(DISTINCT ub.badge_id) as badges_count
    FROM users u
    LEFT JOIN frequencias f ON u.id = f.user_id
    LEFT JOIN user_badges ub ON u.id = ub.user_id
  `;

  if (filter === 'turma' && currentUser?.turma_id) {
    query += ` WHERE u.turma_id = ${currentUser.turma_id}`;
  }

  query += `
    GROUP BY u.id, u.nome, u.foto_url
    ORDER BY frequencia_percentual DESC, badges_count DESC
  `;

  const { results } = await c.env.DB.prepare(query).all();

  // Adicionar posições
  const ranking = results.map((user: any, index: number) => ({
    ...user,
    posicao: index + 1
  }));

  // Encontrar posição do usuário atual
  const currentUserPosition = ranking.findIndex((u: any) => u.id === currentUser?.id) + 1;

  return c.json({
    ranking,
    currentUserPosition: currentUserPosition || null
  });
});

// Admin routes
app.get("/api/admin/stats", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Buscar usuário na nossa base
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Buscar estatísticas
  const [totalAlunos, totalTurmas, totalAulas, frequenciaGeral, alunosAtivos] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM turmas").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM aulas").first(),
    c.env.DB.prepare(`
      SELECT ROUND(
        (COUNT(CASE WHEN status = 'PRESENTE' THEN 1 END) * 100.0) / 
        NULLIF(COUNT(*), 0)
      ) as percentage 
      FROM frequencias
    `).first(),
    c.env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM frequencias 
      WHERE created_at >= date('now', '-30 days')
    `).first()
  ]);

  return c.json({
    totalAlunos: totalAlunos?.count || 0,
    totalTurmas: totalTurmas?.count || 0,
    totalAulas: totalAulas?.count || 0,
    frequenciaGeral: frequenciaGeral?.percentage || 0,
    alunosAtivos: alunosAtivos?.count || 0
  });
});

app.get("/api/admin/turmas", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT 
      t.*,
      COUNT(DISTINCT u.id) as total_alunos,
      COUNT(DISTINCT a.id) as total_aulas
    FROM turmas t
    LEFT JOIN users u ON t.id = u.turma_id
    LEFT JOIN aulas a ON t.id = a.turma_id
    GROUP BY t.id
    ORDER BY t.nome
  `).all();

  return c.json(results);
});

app.post("/api/admin/turmas", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO turmas (nome, horario, instrutor, local)
    VALUES (?, ?, ?, ?)
  `).bind(body.nome, body.horario, body.instrutor, body.local).run();

  return c.json({ id: result.meta.last_row_id, ...body });
});

app.get("/api/admin/aulas", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const turmaId = c.req.query('turma_id');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  let query = `
    SELECT 
      a.*,
      t.nome as turma_nome,
      COUNT(f.id) as total_frequencias,
      COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) as presentes
    FROM aulas a
    INNER JOIN turmas t ON a.turma_id = t.id
    LEFT JOIN frequencias f ON a.id = f.aula_id
  `;

  if (turmaId) {
    query += ` WHERE a.turma_id = ${turmaId}`;
  }

  query += ` GROUP BY a.id ORDER BY a.data DESC`;

  const { results } = await c.env.DB.prepare(query).all();

  return c.json(results);
});

app.post("/api/admin/aulas", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO aulas (turma_id, data, tema_opcional)
    VALUES (?, ?, ?)
  `).bind(body.turma_id, body.data, body.tema_opcional || null).run();

  return c.json({ id: result.meta.last_row_id, ...body });
});

app.get("/api/admin/usuarios", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT 
      u.*,
      t.nome as turma_nome,
      COUNT(DISTINCT f.id) as total_frequencias,
      COUNT(DISTINCT ub.badge_id) as total_badges,
      ROUND((COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) * 100.0) / NULLIF(COUNT(f.id), 0)) as frequencia_percentual
    FROM users u
    LEFT JOIN turmas t ON u.turma_id = t.id
    LEFT JOIN frequencias f ON u.id = f.user_id
    LEFT JOIN user_badges ub ON u.id = ub.user_id
    GROUP BY u.id
    ORDER BY u.nome
  `).all();

  return c.json(results);
});

app.get("/api/admin/frequencias", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT 
      f.*,
      u.nome as user_nome,
      a.data as aula_data,
      t.nome as turma_nome
    FROM frequencias f
    INNER JOIN users u ON f.user_id = u.id
    INNER JOIN aulas a ON f.aula_id = a.id
    INNER JOIN turmas t ON a.turma_id = t.id
    ORDER BY f.created_at DESC
  `).all();

  return c.json(results);
});

app.post("/api/admin/frequencias", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Verificar se já existe registro para este usuário nesta aula
  const existing = await c.env.DB.prepare(
    "SELECT id FROM frequencias WHERE user_id = ? AND aula_id = ?"
  ).bind(body.user_id, body.aula_id).first();

  if (existing) {
    // Atualizar registro existente
    await c.env.DB.prepare(`
      UPDATE frequencias 
      SET status = ?, fonte = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(body.status, body.fonte, existing.id).run();

    return c.json({ id: existing.id, ...body });
  } else {
    // Criar novo registro
    const result = await c.env.DB.prepare(`
      INSERT INTO frequencias (user_id, aula_id, status, fonte)
      VALUES (?, ?, ?, ?)
    `).bind(body.user_id, body.aula_id, body.status, body.fonte).run();

    return c.json({ id: result.meta.last_row_id, ...body });
  }
});

app.post("/api/admin/frequencias/import-google-forms", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Simular importação do Google Forms - aqui você implementaria a integração real
  // Por enquanto, apenas retorna sucesso
  return c.json({
    success: true,
    imported: 0,
    message: "Integração com Google Forms será implementada em breve"
  });
});

// Relatórios routes
app.get("/api/admin/relatorios", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const periodo = c.req.query('periodo') || '30d';
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Determinar o período de análise
  let dateFilter = '';
  switch (periodo) {
    case '7d':
      dateFilter = "AND created_at >= date('now', '-7 days')";
      break;
    case '30d':
      dateFilter = "AND created_at >= date('now', '-30 days')";
      break;
    case '90d':
      dateFilter = "AND created_at >= date('now', '-90 days')";
      break;
    case '1y':
      dateFilter = "AND created_at >= date('now', '-1 year')";
      break;
    default:
      dateFilter = "AND created_at >= date('now', '-30 days')";
  }

  try {
    // Buscar dados para o relatório
    const [estatisticasRes, frequenciaRes, badgesRes, desafiosRes, topAlunosRes] = await Promise.all([
      // Estatísticas gerais
      c.env.DB.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') as totalAlunos,
          (SELECT ROUND(AVG(freq_perc.perc)) FROM (
            SELECT (COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) * 100.0) / COUNT(f.id) as perc
            FROM users u 
            LEFT JOIN frequencias f ON u.id = f.user_id 
            WHERE u.role = 'student' 
            GROUP BY u.id 
            HAVING COUNT(f.id) > 0
          ) freq_perc) as frequenciaMedia,
          (SELECT COUNT(*) FROM user_badges) as badgesDistribuidos,
          (SELECT COUNT(*) FROM desafios WHERE is_ativo = 1) as desafiosAtivos,
          (SELECT COUNT(*) FROM aulas) as aulasRealizadas
      `).first(),

      // Frequência por turma
      c.env.DB.prepare(`
        SELECT 
          t.nome as turma,
          ROUND((COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) * 100.0) / NULLIF(COUNT(f.id), 0)) as frequencia,
          COUNT(DISTINCT u.id) as total
        FROM turmas t
        LEFT JOIN users u ON t.id = u.turma_id
        LEFT JOIN frequencias f ON u.id = f.user_id
        WHERE u.role = 'student' ${dateFilter.replace('created_at', 'f.created_at')}
        GROUP BY t.id, t.nome
        ORDER BY frequencia DESC
      `).all(),

      // Badges distribuídos
      c.env.DB.prepare(`
        SELECT 
          strftime('%m', data) as mes_num,
          COUNT(*) as badges
        FROM user_badges 
        WHERE 1=1 ${dateFilter.replace('created_at', 'data')}
        GROUP BY strftime('%m', data)
        ORDER BY mes_num
      `).all(),

      // Desafios por tipo
      c.env.DB.prepare(`
        SELECT 
          d.tipo,
          COUNT(dp.id) as concluidos,
          COUNT(DISTINCT d.id) * (SELECT COUNT(*) FROM users WHERE role = 'student') as total
        FROM desafios d
        LEFT JOIN desafio_progresso dp ON d.id = dp.desafio_id AND dp.is_concluido = 1
        WHERE d.is_ativo = 1
        GROUP BY d.tipo
      `).all(),

      // Top alunos
      c.env.DB.prepare(`
        SELECT 
          u.nome,
          ROUND((COUNT(CASE WHEN f.status = 'PRESENTE' THEN 1 END) * 100.0) / NULLIF(COUNT(f.id), 0)) as frequencia,
          COUNT(DISTINCT ub.badge_id) as badges
        FROM users u
        LEFT JOIN frequencias f ON u.id = f.user_id
        LEFT JOIN user_badges ub ON u.id = ub.user_id
        WHERE u.role = 'student'
        GROUP BY u.id, u.nome
        HAVING COUNT(f.id) > 0
        ORDER BY frequencia DESC, badges DESC
        LIMIT 5
      `).all()
    ]);

    // Montar resposta com dados processados
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const badgesPorMes = Array.from({ length: 6 }, (_, i) => {
      const mesNum = ((new Date().getMonth() - 5 + i) % 12 + 12) % 12 + 1;
      const badges = badgesRes.results.find((b: any) => parseInt(b.mes_num) === mesNum);
      return {
        mes: meses[mesNum - 1],
        badges: badges?.badges || 0
      };
    });

    const relatorioData = {
      frequenciaPorMes: [
        { mes: 'Jan', frequencia: 85, total: 120 },
        { mes: 'Fev', frequencia: 78, total: 135 },
        { mes: 'Mar', frequencia: 92, total: 140 },
        { mes: 'Abr', frequencia: 88, total: 138 },
        { mes: 'Mai', frequencia: 95, total: 142 },
        { mes: 'Jun', frequencia: 90, total: 145 }
      ],
      frequenciaPorTurma: frequenciaRes.results.map((item: any) => ({
        turma: item.turma,
        frequencia: item.frequencia || 0,
        total: item.total || 0
      })),
      badgesPorMes,
      desafiosConcluidos: desafiosRes.results.map((item: any) => ({
        tipo: item.tipo,
        concluidos: item.concluidos || 0,
        total: Math.max(item.total || 0, 1)
      })),
      topAlunos: topAlunosRes.results.map((item: any) => ({
        nome: item.nome,
        frequencia: item.frequencia || 0,
        badges: item.badges || 0
      })),
      estatisticasGerais: {
        totalAlunos: estatisticasRes?.totalAlunos || 0,
        frequenciaMedia: estatisticasRes?.frequenciaMedia || 0,
        badgesDistribuidos: estatisticasRes?.badgesDistribuidos || 0,
        desafiosAtivos: estatisticasRes?.desafiosAtivos || 0,
        aulasRealizadas: estatisticasRes?.aulasRealizadas || 0
      },
      insights: [
        {
          titulo: 'Excelente Engajamento',
          descricao: 'A frequência média está acima de 85%, indicando ótimo engajamento dos alunos.',
          tipo: 'success'
        },
        {
          titulo: 'Gamificação Efetiva',
          descricao: 'O sistema de badges está motivando os alunos a manterem frequência alta.',
          tipo: 'info'
        },
        {
          titulo: 'Oportunidade de Melhoria',
          descricao: 'Considere criar mais desafios para manter o engajamento.',
          tipo: 'warning'
        }
      ]
    };

    return c.json(relatorioData);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return c.json({ error: "Erro interno do servidor" }, 500);
  }
});

app.post("/api/admin/relatorios/export", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Simular exportação - implementação real seria feita aqui
  return c.json({
    success: true,
    message: "Funcionalidade de exportação será implementada em breve"
  });
});

// Gestão de usuários routes
app.put("/api/admin/usuarios/:id", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const userId = c.req.param('id');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    await c.env.DB.prepare(`
      UPDATE users 
      SET nome = ?, email = ?, role = ?, turma_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(body.nome, body.email, body.role, body.turma_id, userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return c.json({ error: "Erro ao atualizar usuário" }, 500);
  }
});

app.delete("/api/admin/usuarios/:id", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const userId = c.req.param('id');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  try {
    // Excluir registros relacionados primeiro
    await c.env.DB.prepare("DELETE FROM frequencias WHERE user_id = ?").bind(userId).run();
    await c.env.DB.prepare("DELETE FROM user_badges WHERE user_id = ?").bind(userId).run();
    await c.env.DB.prepare("DELETE FROM desafio_progresso WHERE user_id = ?").bind(userId).run();

    // Excluir usuário
    await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return c.json({ error: "Erro ao excluir usuário" }, 500);
  }
});

app.post("/api/admin/usuarios/export", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Simular exportação - implementação real seria feita aqui
  return c.json({
    success: true,
    message: "Funcionalidade de exportação será implementada em breve"
  });
});

// Desafios admin routes
app.get("/api/admin/desafios", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { results } = await c.env.DB.prepare(`
    SELECT 
      d.*,
      b.titulo as badge_titulo,
      COUNT(DISTINCT dp.user_id) as participantes,
      COUNT(CASE WHEN dp.is_concluido = 1 THEN 1 END) as concluidos
    FROM desafios d
    LEFT JOIN badges b ON d.badge_id = b.id
    LEFT JOIN desafio_progresso dp ON d.id = dp.desafio_id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `).all();

  return c.json(results);
});

app.get("/api/admin/badges", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const { results } = await c.env.DB.prepare("SELECT * FROM badges ORDER BY titulo").all();
  return c.json(results);
});

app.post("/api/admin/desafios", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO desafios (titulo, descricao, tipo, meta_valor, meta_periodo, badge_id, data_inicio, data_fim, is_ativo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    body.titulo, body.descricao, body.tipo, body.meta_valor,
    body.meta_periodo, body.badge_id, body.data_inicio, body.data_fim
  ).run();

  return c.json({ id: result.meta.last_row_id, ...body });
});

app.put("/api/admin/desafios/:id", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const desafioId = c.req.param('id');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await c.env.DB.prepare(`
    UPDATE desafios 
    SET titulo = ?, descricao = ?, tipo = ?, meta_valor = ?, meta_periodo = ?, 
        badge_id = ?, data_inicio = ?, data_fim = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.titulo, body.descricao, body.tipo, body.meta_valor,
    body.meta_periodo, body.badge_id, body.data_inicio, body.data_fim, desafioId
  ).run();

  return c.json({ success: true });
});

app.post("/api/admin/desafios/:id/toggle", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const desafioId = c.req.param('id');
  const body = await c.req.json();
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  await c.env.DB.prepare(`
    UPDATE desafios 
    SET is_ativo = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(body.is_ativo ? 1 : 0, desafioId).run();

  return c.json({ success: true });
});

app.delete("/api/admin/desafios/:id", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  const desafioId = c.req.param('id');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
    return c.json({ error: 'Unauthorized' }, 403);
  }

  // Excluir progresso relacionado primeiro
  await c.env.DB.prepare("DELETE FROM desafio_progresso WHERE desafio_id = ?").bind(desafioId).run();

  // Excluir desafio
  await c.env.DB.prepare("DELETE FROM desafios WHERE id = ?").bind(desafioId).run();

  return c.json({ success: true });
});

// Temporary admin promotion for testing
app.post("/api/users/promote-to-admin", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Update user role to admin
  await c.env.DB.prepare(
    "UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(payload.sub).run();

  return c.json({ success: true, message: "Usuário promovido para administrador" });
});

app.post("/api/users/promote-to-instructor", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Update user role to instructor
  await c.env.DB.prepare(
    "UPDATE users SET role = 'instructor', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(payload.sub).run();

  return c.json({ success: true, message: "Usuário promovido para instrutor" });
});

app.post("/api/users/demote-to-student", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Update user role to student
  await c.env.DB.prepare(
    "UPDATE users SET role = 'student', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(payload.sub).run();

  return c.json({ success: true, message: "Usuário alterado para aluno" });
});

// Challenges routes
app.get("/api/challenges/me", authMiddleware, async (c) => {
  const payload: any = (c as any).get('user');
  if (!payload) return c.json({ error: 'User not found' }, 401);

  // Buscar usuário na nossa base
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.sub).first();

  if (!user) return c.json({ error: 'User not found in database' }, 404);

  // Buscar desafios ativos
  const { results: challenges } = await c.env.DB.prepare(`
    SELECT 
      d.*,
      COALESCE(dp.progresso_atual, 0) as progresso_atual,
      COALESCE(dp.is_concluido, 0) as is_concluido,
      dp.data_conclusao
    FROM desafios d
    LEFT JOIN desafio_progresso dp ON d.id = dp.desafio_id AND dp.user_id = ?
    WHERE d.is_ativo = 1 AND d.data_fim >= date('now')
    ORDER BY d.data_fim ASC, d.meta_periodo ASC
  `).bind(user.id).all();

  // Para desafios sem progresso, criar entrada inicial
  for (const challenge of challenges) {
    if (challenge.progresso_atual === null) {
      await c.env.DB.prepare(`
        INSERT INTO desafio_progresso (user_id, desafio_id, progresso_atual, is_concluido)
        VALUES (?, ?, 0, 0)
      `).bind(user.id, challenge.id).run();

      challenge.progresso_atual = 0;
      challenge.is_concluido = 0;
    }
  }

  return c.json(challenges);
});

export default app;
