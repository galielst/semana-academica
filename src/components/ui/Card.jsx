export default function Card({ children, className = "" }) {
  return (
    <div
      style={{background:'white',borderRadius:16,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',padding:16}}
      className={className}
    >
      {children}
    </div>
  );
}
