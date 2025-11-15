import { useEffect } from "react";
import TireTreadImage from '../resources/pictures/tire_tread.jpeg';
import PasswordReset from "../components/PasswordReset.tsx";

const ResetPasswordPage = () => {

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;

        // Apply to both <html> and <body>
        html.style.height = "100%";
        html.style.overflowX = "hidden";
        html.style.overscrollBehavior = "none";

        body.style.backgroundImage = `url(${TireTreadImage})`;
        body.style.backgroundRepeat = "repeat";
        body.style.backgroundSize = "cover";
        body.style.backgroundPosition = "center";
        body.style.backgroundColor = "var(--muted3)";
        body.style.backgroundBlendMode = "multiply";
        body.style.overflowX = "hidden";
        body.style.minHeight = "100vh";
        body.style.margin = "0";
        body.style.backgroundAttachment = "fixed";

        // Cleanup on unmount
        return () => {
            body.removeAttribute("style");
            html.removeAttribute("style");
        };
    }, []);

    return (
        <main>
            <PasswordReset/>
        </main>
    );
}
export default ResetPasswordPage;