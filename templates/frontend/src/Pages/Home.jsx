import React from "react";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome {user ? user.username : "User"} 🎉</h1>
      <p>You are now logged in!</p>
    </div>
  );
}
