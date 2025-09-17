export default function Button({ children, className = "", ...props }) {
  return (
    <button
      style={{padding:"8px 14px", borderRadius:16, border:"1px solid #e5e7eb", background:"#fff"}}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
