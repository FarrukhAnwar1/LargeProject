import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import CarsUI from '../components/CarsUI';
const CarsPage = () => {
    return (
        <div>
            <LoggedInName />
            <CarsUI />
        </div>
    );
}
export default CarsPage;