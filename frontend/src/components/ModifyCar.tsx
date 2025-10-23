type ModifyCarProps = {
    carId?: string;
};

const ModifyCar = ({ carId }: ModifyCarProps) => {
    return (
        <div>
            <p>Car ID: {carId}</p>
        </div>
    );
}
export default ModifyCar;