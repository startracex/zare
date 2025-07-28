export default function IndexPage() {
  return (
    <div style={{
      margin: "5vh 0",
      display: "flex",
      width: "100vw",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    }}>
      <h1 style={{
        background: `linear-gradient(146deg,#fff,#757a7d)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        color: 'transparent',
        fontSize: 64,
        fontWeight: 'bold',
      }}>@(Zare)</h1>
      <p>A File-Based Component-Based Template Engine</p>
    </div>
  )
}