export default function Label({ children }) {
  return (
    <label style={{fontSize:12,fontWeight:600,color:"#374151", display:"block", marginBottom:4}}>
      {children}
    </label>
  );
}
