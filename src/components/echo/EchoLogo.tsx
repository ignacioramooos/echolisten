import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const EchoLogo = () => {
  const navigate = useNavigate();
  const [href, setHref] = useState("/");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHref(session ? "/dashboard" : "/");
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setHref(session ? "/dashboard" : "/");
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <button
      onClick={() => navigate(href)}
      className="font-display italic text-[24px] text-foreground select-none bg-transparent border-none cursor-pointer p-0"
    >
      <span className="mr-0.5">●</span> Cor ad Cor
    </button>
  );
};

export { EchoLogo };
