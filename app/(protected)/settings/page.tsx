import { EnrichedSession, auth } from "@/auth";
import React from "react";

const SettingPage = async () => {
  const sesstion = (await auth()) as EnrichedSession;

  return (
    <div>
      <h1>Setting Page</h1>
      <p>Session: {JSON.stringify(sesstion?.user)}</p>

      <form>
        <button type="submit">Signout</button>
      </form>
    </div>
  );
};

export default SettingPage;
