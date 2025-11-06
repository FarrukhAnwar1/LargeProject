import Verification from "../components/Verification";
import { useParams, useSearchParams } from "react-router-dom";

const VerificationPage = () => {
    const { verificationToken } = useParams<{ verificationToken: string }>();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'email';

    return (
        <Verification 
            verificationToken={verificationToken}
            type={type}
        />
    );
}
export default VerificationPage;