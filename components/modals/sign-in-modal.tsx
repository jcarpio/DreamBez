import { signIn } from "next-auth/react"; //
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { siteConfig } from "@/config/site";

function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [signInProvider, setSignInProvider] = useState<string | null>(null);
  
  // Invitation code state
  const [inviteCode, setInviteCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false); // Track if code is valid

  // Valid invitation code (you can also fetch this from the server or env variables)
  const VALID_CODE = "DREAMBEZ123";

  // Function to handle the code validation
  const handleCodeValidation = () => {
    if (inviteCode === VALID_CODE) {
      setIsCodeValid(true); // Code is valid, show sign-in options
    } else {
      alert("Invalid invitation code"); // Show error message
    }
  };

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full">
        {!isCodeValid ? (
          // Invitation Code Form
          <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
            <Icons.logo className="size-10" />
            <h3 className="font-urban text-2xl font-bold">Enter Invitation Code</h3>
            <p className="text-sm text-gray-500">
              Please enter your invitation code to access the sign-in options.
            </p>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invitation code"
              className="p-2 border rounded-md"
            />
            <Button onClick={handleCodeValidation} variant="default">
              Submit Code
            </Button>
          </div>
        ) : (
          // Sign-in Modal Content (when code is valid)
          <div>
            <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
              <a href={siteConfig.url}>
                <Icons.logo className="size-10" />
              </a>
              <h3 className="font-urban text-2xl font-bold">Sign In</h3>
            
            </div>

            <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
              <Button
                variant="default"
                disabled={signInClicked}
                onClick={() => {
                  setSignInClicked(true);
                  setSignInProvider("google");
                  signIn("google", {
                    redirect: false,
                    callbackUrl: "/dashboard",
                  }).then(() =>
                    setTimeout(() => {
                      setShowSignInModal(false);
                    }, 400),
                  );
                }}
              >
                {signInClicked && signInProvider === "google" ? (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 size-4" />
                )}{" "}
                Sign In with Google
              </Button>
             
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({
      setShowSignInModal,
      SignInModal: SignInModalCallback,
    }),
    [setShowSignInModal, SignInModalCallback],
  );
}


/*

import { signIn } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { siteConfig } from "@/config/site";

function SignInModal({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [signInClicked, setSignInClicked] = useState(false);
  const [signInProvider, setSignInProvider] = useState<string | null>(null);

  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url}>
            <Icons.logo className="size-10" />
          </a>
          <h3 className="font-urban text-2xl font-bold">Sign In</h3>
          <p className="text-sm text-gray-500">
            You can{" "}
            <a href="/login" className="text-primary underline">
              Login
            </a>{" "}
            or <a href="/register" className="text-primary underline">
              Register
            </a>{" "}
            using your email.
          </p>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              setSignInProvider("google");
              signIn("google", { redirect: false, callbackUrl: "/dashboard" }).then(() =>
                setTimeout(() => {
                  setShowSignInModal(false);
                }, 400),
              );
            }}
          >
            {signInClicked && signInProvider === "google" ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Sign In with Google
          </Button>
          <Button
            variant="default"
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              setSignInProvider("linkedin");
              signIn("linkedin", { redirect: false, callbackUrl: "/dashboard" }).then(() =>
                setTimeout(() => {
                  setShowSignInModal(false);
                }, 400),
              );
            }}
          >
            {signInClicked && signInProvider === "linkedin" ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.linkedin className="mr-2 size-4" />
            )}{" "}
            Sign In with LinkedIn
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    );
  }, [showSignInModal, setShowSignInModal]);

  return useMemo(
    () => ({
      setShowSignInModal,
      SignInModal: SignInModalCallback,
    }),
    [setShowSignInModal, SignInModalCallback],
  );
}
*/
