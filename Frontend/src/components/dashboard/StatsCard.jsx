import PropTypes from "prop-types";

const StatsCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${color.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color.icon}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={color.text}>{subtitle}</span>
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.shape({
    bg: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  subtitle: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default StatsCard;