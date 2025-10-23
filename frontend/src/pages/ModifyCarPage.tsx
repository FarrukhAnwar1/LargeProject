import ModifyCar from "../components/ModifyCar";
import { useParams } from "react-router-dom";

const ModifyCarPage = () => {
    const { carId } = useParams<{ carId: string }>();

    return (
        <ModifyCar carId = {carId} />
    );
}
export default ModifyCarPage;