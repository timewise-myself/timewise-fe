import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import Header from "./header";
import Social from "./social";

interface Props {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  isSignUp?: boolean;
}
const Wrapper = ({ children, headerLabel, showSocial, isSignUp }: Props) => {
  return (
    <Card className="w-[400px] h-full border-none m-auto">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {!isSignUp && <>{showSocial && <Social />}</>}
      {/* dont have an account  */}
      {isSignUp && (
        <p className="text-center text-sm text-muted-foreground py-2">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-primary">
            Sign In
          </a>
        </p>
      )}
      {/* have an account */}
      {!isSignUp && (
        <p className="text-center text-sm text-muted-foreground py-2">
          {"Don't have an account?"}
          <a href="/auth/sign-up" className="text-primary">
            Sign Up
          </a>
        </p>
      )}
    </Card>
  );
};

export default Wrapper;
