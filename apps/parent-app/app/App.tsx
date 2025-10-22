import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login"); // tương đương redirect("/login") trong Next.js
  }, [navigate]);

  return null;
};

export default App;
