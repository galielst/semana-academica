export default function Badge({ children }) {
  return (
    <span style={{fontSize:12, padding:"2px 8px", borderRadius:999, background:"#eef2ff", color:"#3730a3"}}>
      {children}
    </span>
  );
}
