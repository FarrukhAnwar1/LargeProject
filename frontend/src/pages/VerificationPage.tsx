import Verification from "../components/Verification";
import { useParams } from "react-router-dom";

const VerificationPage = () => {
    const { verificationToken } = useParams<{ verificationToken: string }>();

    return (
        <Verification verificationToken = {verificationToken} />
    );
}
export default VerificationPage;