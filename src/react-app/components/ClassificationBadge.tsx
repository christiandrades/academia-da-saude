interface ClassificationBadgeProps {
  percentage: number;
}

export default function ClassificationBadge({ percentage }: ClassificationBadgeProps) {
  const getClassification = (percentage: number) => {
    if (percentage >= 95) {
      return {
        icon: '🟢',
        label: 'Exemplo do mês!',
        color: 'text-accent',
        bgColor: 'bg-accent/20'
      };
    } else if (percentage >= 75) {
      return {
        icon: '🥈',
        label: 'Muito bom!',
        color: 'text-complement',
        bgColor: 'bg-complement/20'
      };
    } else if (percentage >= 50) {
      return {
        icon: '🟨',
        label: 'Quase lá, continue!',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/20'
      };
    } else if (percentage >= 30) {
      return {
        icon: '🟥',
        label: 'Atenção: precisamos de você!',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20'
      };
    } else {
      return {
        icon: '🔴',
        label: 'Recomeçar no próximo mês',
        color: 'text-red-500',
        bgColor: 'bg-red-500/20'
      };
    }
  };

  const classification = getClassification(percentage);

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${classification.bgColor} border border-white/10`}>
      <span className="text-2xl">{classification.icon}</span>
      <span className={`font-semibold ${classification.color}`}>
        {classification.label}
      </span>
    </div>
  );
}
