export default function Input({ className = "", ...props }) {
  return (
    <input
      style={{width:"100%", border:"1px solid #e5e7eb", borderRadius:12, padding:"8px 10px", outline:"none"}}
      className={className}
      {...props}
    />
  );
}
