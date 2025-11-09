import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { buildPath } from '../utils/Path';
import ConfirmModal from './ConfirmModal';
import TileCarousel from './TileCarousel';
import NumericInput from './NumericInput';

// Configure axios defaults for this component
axios.defaults.withCredentials = true;

type ModifyCarProps = {
    carId?: string; // pass 'add' to create a new car
};

type CarForm = {
    licensePlate: string;
    year: string;
    color: string;
    make: string;
    model: string;
    mileage: number;
    vehicleIdentificationNumber: string;
    carType: string; // single select for simplicity
    rentalStatus: string;
    warningLightIndicators: { id: number; text: string; removing?: boolean }[];
};

type RentalForm = {
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    dateRentedOut: string;
    expectedReturnDate: string;
    rentalRatePerDay: number;
    notes: string;
    actualReturnDate?: string;
    _id?: string; // Rental ID for updates
};

const emptyCar: CarForm = {
    licensePlate: '', year: '', color: '', make: '', model: '', mileage: 0, vehicleIdentificationNumber: '', carType: 'sedan', rentalStatus: 'available', warningLightIndicators: []
};

const emptyRental: RentalForm = {
    renterName: '', renterEmail: '', renterPhone: '', dateRentedOut: '', expectedReturnDate: '', rentalRatePerDay: 0, notes: '', actualReturnDate: ''
};

const ModifyCar = ({ carId }: ModifyCarProps) => {
    const navigate = useNavigate();
    const isAdd = carId === 'add' || !carId;
    const [carForm, setCarForm] = useState<CarForm>(emptyCar);
    const [rentalForm, setRentalForm] = useState<RentalForm>(emptyRental);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [errors, setErrors] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [countdown, setCountdown] = useState<number>(5);
    const redirectTimerRef = useRef<number | undefined>(undefined);
    // Rental visibility is derived from rentalStatus === 'rented'

    // Tile options for car type and rental status. Icons are expected in ../resources/icons
    const carTypeOptions = [
        { id: 'sedan', label: 'Sedan', icon: 'sedan.png' },
        { id: 'suv', label: 'SUV', icon: 'suv.png' },
        { id: 'truck', label: 'Truck', icon: 'truck.png' },
        { id: 'coupe', label: 'Coupe', icon: 'coupe.png' },
        { id: 'convertible', label: 'Convertible', icon: 'convertible.png' },
        { id: 'hatchback', label: 'Hatchback', icon: 'hatchback.png' },
        { id: 'van', label: 'Van', icon: 'van.png' },
        { id: 'motorcycle', label: 'Motorcycle', icon: 'motorcycle.png' },
        { id: 'other', label: 'Other', icon: 'other.png' }
    ];

    const rentalStatusOptions = [
        { id: 'available', label: 'Available', icon: 'available.png' },
        { id: 'rented', label: 'Rented', icon: 'rented.png' },
        { id: 'maintenance', label: 'Maintenance', icon: 'maintenance.png' }
    ];

    // Helpers to update typed form fields without using `any` casts
    type CarInputKey = Exclude<keyof CarForm, 'warningLightIndicators'>;
    function setCarField<K extends CarInputKey>(key: K, value: CarForm[K]) {
        setCarForm(prev => ({ ...prev, [key]: value } as CarForm));
    }

    function setRentalField<K extends keyof RentalForm>(key: K, value: RentalForm[K]) {
        setRentalForm(prev => ({ ...prev, [key]: value } as RentalForm));
    }

    // Handle countdown timer for success modal
    useEffect(() => {
        if (showSuccessModal) {
            setCountdown(5);
            const intervalId = window.setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        navigate('/cars');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            redirectTimerRef.current = intervalId;


            return () => {
                if (redirectTimerRef.current) {
                    window.clearInterval(redirectTimerRef.current);
                    redirectTimerRef.current = undefined;
                }
            };
        }
    }, [showSuccessModal, navigate]);

    // Define the Car type at the top level
    interface Car {
        _id: string;
        licensePlate: string;
        year: number;
        color: string;
        make: string;
        model: string;
        mileage: number;
        vehicleIdentificationNumber: string;
        carType: string;
        rentalStatus: string;
        warningLightIndicators: string[];
    }

    useEffect(() => {
        if (!isAdd && carId) {
            // Placeholder: fetch car and its current rental (if any)
            (async () => {
                setLoading(true);
                try {
                    // Get car details from GET /api/car (gets all cars)
                    const carRes = await axios.get<{ success: boolean; cars: Car[] }>(buildPath('api/car'));
                    const car = carRes.data?.cars?.find(c => c._id === carId);
                    if (car) {
                        console.log('Found car:', car); // Debug log
                        setCarForm({
                            licensePlate: car.licensePlate ?? '',
                            year: car.year?.toString() ?? '',
                            color: car.color ?? '',
                            make: car.make ?? '',
                            model: car.model ?? '',
                            mileage: car.mileage != null ? Number(car.mileage) : 0,
                            vehicleIdentificationNumber: car.vehicleIdentificationNumber ?? '',
                            carType: car.carType ?? 'sedan',
                            warningLightIndicators: Array.isArray(car.warningLightIndicators) ? car.warningLightIndicators.map((text: string) => ({ id: Date.now() + Math.random(), text })) : [],
                            rentalStatus: car.rentalStatus ?? 'available'
                        });
                    } else {
                        console.error('Car not found with ID:', carId);
                        setMessage('Car not found.');
                    }

                    // Get rental info from GET /api/rental/:carID
                    try {
                        console.log('Fetching rental for car ID:', carId); // Debug log
                        const rentRes = await axios.get(buildPath(`api/rental/${carId}`));
                        console.log('Rental response:', rentRes.data); // Debug log

                        const rentals = rentRes.data?.rentals;
                        // Get the most recent rental
                        const currentRental = Array.isArray(rentals) && rentals.length > 0 ?
                            rentals[0] : null; // rentals are already sorted by dateRentedOut DESC

                        if (currentRental) {
                            console.log('Found rental:', currentRental); // Debug log
                            setRentalForm({
                                renterName: currentRental.renterName ?? '',
                                renterEmail: currentRental.renterEmail ?? '',
                                renterPhone: currentRental.renterPhone ?? '',
                                dateRentedOut: currentRental.dateRentedOut ? new Date(currentRental.dateRentedOut).toISOString().slice(0, 10) : '',
                                expectedReturnDate: currentRental.expectedReturnDate ? new Date(currentRental.expectedReturnDate).toISOString().slice(0, 10) : '',
                                actualReturnDate: currentRental.actualReturnDate ? new Date(currentRental.actualReturnDate).toISOString().slice(0, 10) : '',
                                rentalRatePerDay: Number(currentRental.rentalRatePerDay) || 0,
                                notes: currentRental.notes ?? '',
                                _id: currentRental._id // Store the rental ID for updates
                            });

                            // Also make sure rental status is set to rented if there's a current rental
                            setCarForm(prev => ({
                                ...prev,
                                rentalStatus: 'rented'
                            }));
                        }
                    } catch (err) {
                        console.error('Error fetching rental:', err);
                    }
                } catch (err) {
                    console.error(err);
                    setMessage('Unable to load car data.');
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [carId, isAdd]);

    const handleCarChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const name = e.target.name as CarInputKey;
        const value = e.target.value;
        if (name === 'mileage') {
            // Handle mileage input
            const n = value === '' ? 0 : Number(value.replace(/^0+/, '')); // Remove leading zeros
            if (!Number.isNaN(n)) {
                setCarField(name, n as CarForm[typeof name]);
            }
            return;
        }
        setCarField(name, value as unknown as CarForm[typeof name]);
    };

    const addWarningIndicator = () => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setCarForm(prev => ({ ...prev, warningLightIndicators: [...prev.warningLightIndicators, { id, text: '' }] }));
    };

    const updateWarningIndicator = (idx: number, val: string) => {
        setCarForm(prev => ({ ...prev, warningLightIndicators: prev.warningLightIndicators.map((it, i) => i === idx ? { ...it, text: val } : it) }));
    };

    const removeWarningIndicator = (idx: number) => {
        // mark removing to play animation, then remove after delay
        setCarForm(prev => ({ ...prev, warningLightIndicators: prev.warningLightIndicators.map((it, i) => i === idx ? { ...it, removing: true } : it) }));
        setTimeout(() => {
            setCarForm(prev => ({ ...prev, warningLightIndicators: prev.warningLightIndicators.filter((_, i) => i !== idx) }));
        }, 220);
    };

    const handleRentalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name as keyof RentalForm;
        const value = e.target.value;

        if (name === 'dateRentedOut') {
            // Reset related date fields when rental date changes
            setRentalForm(prev => ({
                ...prev,
                dateRentedOut: value,
                expectedReturnDate: '',
                actualReturnDate: ''
            }));
            return;
        }

        if (name === 'rentalRatePerDay') {
            const n = value === '' ? 0 : Number(value);
            if (!Number.isNaN(n) && n >= 0) { // Ensure non-negative
                setRentalField(name, n);
            }
            return;
        }

        // Handle all string values consistently
        setRentalField(name, value as RentalForm[typeof name]);
    };

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!carForm.licensePlate || carForm.licensePlate.trim().length < 2) errs.push('License plate is required (min 2 chars).');
        const yearNum = Number(carForm.year);
        if (!carForm.year || Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) errs.push('Enter a valid year.');
        if (!carForm.make) errs.push('Make is required.');
        if (!carForm.model) errs.push('Model is required.');
        if (!carForm.color || carForm.color.trim().length === 0) errs.push('Color is required.');
        if (!carForm.vehicleIdentificationNumber) errs.push('Vehicle identification number is required.');
        const mileageNum = carForm.mileage;
        if (Number.isNaN(mileageNum) || mileageNum < 0) errs.push('Mileage must be a non-negative number.');

        // Validate that all warning light indicators are not empty
        carForm.warningLightIndicators.forEach((indicator, index) => {
            if (!indicator.text || indicator.text.trim().length === 0) {
                errs.push(`Issue #${index + 1} cannot be empty.`);
            }
        });

        // Validate rental fields when status is 'rented'
        if (carForm.rentalStatus === 'rented') {
            if (!rentalForm.renterName) errs.push('Renter name is required when status is rented.');
            if (!rentalForm.renterEmail) errs.push('Renter email is required when status is rented.');
            if (!rentalForm.renterPhone) errs.push('Renter phone is required when status is rented.');
            if (!rentalForm.dateRentedOut) errs.push('Date rented out is required when status is rented.');
            if (!rentalForm.expectedReturnDate) errs.push('Expected return date is required when status is rented.');
            const rateNum = rentalForm.rentalRatePerDay;
            if (Number.isNaN(rateNum) || rateNum < 0) errs.push('Rental rate per day must be a non-negative number.');
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const doSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setMessage('');
        if (!validate()) return;
        setLoading(true);

        try {
            const carPayload = {
                licensePlate: carForm.licensePlate.trim(),
                year: Number(carForm.year),
                color: carForm.color.trim(),
                make: carForm.make.trim(),
                model: carForm.model.trim(),
                mileage: carForm.mileage,
                vehicleIdentificationNumber: carForm.vehicleIdentificationNumber.trim(),
                carType: carForm.carType,
                warningLightIndicators: carForm.warningLightIndicators.map(i => i.text),
                rentalStatus: carForm.rentalStatus
            };

            let savedCarId = carId;

            if (isAdd) {
                const res = await axios.post(buildPath('api/car/add'), carPayload);
                if (!res.data?.car?._id) throw new Error('No car ID returned from server');
                savedCarId = res.data.car._id;
                setMessage('Car added successfully!');
            } else {
                await axios.patch(buildPath(`api/car/${carId}`), carPayload);
                setMessage('Car updated successfully!');
            }

            // --- Handle rental creation/update ---
            if (carForm.rentalStatus === 'rented') {
                const rentalPayload = {
                    renterName: rentalForm.renterName.trim(),
                    renterEmail: rentalForm.renterEmail.trim(),
                    renterPhone: rentalForm.renterPhone.trim(),
                    dateRentedOut: rentalForm.dateRentedOut,
                    expectedReturnDate: rentalForm.expectedReturnDate,
                    actualReturnDate: rentalForm.actualReturnDate || undefined,
                    rentalRatePerDay: Number(rentalForm.rentalRatePerDay) || 0,
                    notes: rentalForm.notes?.trim(),
                    carID: savedCarId
                };

                if (rentalForm._id) {
                    await axios.put(buildPath(`api/rental/${rentalForm._id}`), rentalPayload);
                } else {
                    await axios.post(buildPath('api/rental'), rentalPayload);
                }
            } else if (!isAdd) {
                await axios.delete(buildPath(`api/rental/car/${savedCarId}`)).catch(err => {
                    if (!(err instanceof AxiosError) || err.response?.status !== 404) throw err;
                });
            }

            // ✅ Only show modal when everything succeeds
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Error saving car:', err);
            if (err instanceof AxiosError && err?.response?.data?.message) {
                setMessage(err.response.data.message);
                setErrors([err.response.data.message]);
            } else {
                setMessage('An error occurred while saving.');
                setErrors(['An error occurred while saving.']);
            }
            setShowSuccessModal(false);
        } finally {
            setLoading(false);
        }
    };

    const doDelete = async () => {
        if (!carId) return setMessage('No car selected to delete.');
        setLoading(true);
        setMessage('');
        try {
            // First delete all rentals associated with this car
            try {
                await axios.delete(buildPath(`api/rental/car/${carId}`));
                console.log('Successfully deleted all rentals for car:', carId);
            } catch (err) {
                // Ignore 404 errors (no rentals found)
                if (!(err instanceof AxiosError) || err.response?.status !== 404) {
                    throw err;
                }
            }

            // Then delete the car
            await axios.delete(buildPath(`api/car/${carId}`));
            setMessage('Car and associated rentals deleted.');
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Error during deletion:', err);
            if (err instanceof AxiosError && err?.response?.data?.message) setMessage(err.response.data.message);
            else setMessage('Failed to delete car.');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="card max-w-2xl mx-auto p-6 relative" style={{ minWidth: 320 }}>
            <div className='absolute right-4 top-4'>
                <button className='px-3 py-2 bg-white border hover:bg-gray-50 flex items-center gap-2' onClick={() => history.back()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Cancel
                </button>
            </div>
            <div className='text-center'>
                <strong className='text-2xl font-bold'>{isAdd ? 'Add Car' : 'Edit Car'}</strong>
            </div>

            {loading && <div className='text-center text-sm mt-2'>Loading...</div>}

            <hr className='my-4' />
            <div className='text-lg font-semibold'>Car Information</div>

            <div className='pt-4'>
                <label className='block font-medium'>License Plate</label>
                <input placeholder='ABC-1234' name='licensePlate' value={carForm.licensePlate} onChange={handleCarChange} className='p-2 w-full' />
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block font-medium'>Year</label>
                    <NumericInput
                        value={carForm.year ? Number(carForm.year) : 0}
                        onChange={(num) => setCarField('year', num.toString())}
                        placeholder="2025"
                        className="p-2 w-full"
                        min={0}
                        max={new Date().getFullYear() + 1}
                        hideThousandSeparator
                    />
                </div>
                <div>
                    <label className='block font-medium'>Mileage</label>
                    <NumericInput
                        value={carForm.mileage}
                        onChange={(num) => setCarField('mileage', num)}
                        placeholder="0"
                        className="p-2 w-full"
                    />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block font-medium'>Make</label>
                    <input placeholder='Toyota' name='make' value={carForm.make} onChange={handleCarChange} className='p-2 w-full' />
                </div>
                <div>
                    <label className='block font-medium'>Model</label>
                    <input placeholder='Camry' name='model' value={carForm.model} onChange={handleCarChange} className='p-2 w-full' />
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 pt-4'>
                <div>
                    <label className='block font-medium'>Color</label>
                    <input required placeholder='Black' name='color' value={carForm.color} onChange={handleCarChange} className='p-2 w-full' />
                </div>
                <div>
                    <label className='block font-medium'>Vehicle Identification Number</label>
                    <input placeholder='1A2BC34567D890123' name='vehicleIdentificationNumber' value={carForm.vehicleIdentificationNumber} onChange={handleCarChange} className='p-2 w-full' />
                </div>
            </div>

            <div className='pt-4'>
                <div>
                    <label className='block font-medium mb-2'>Car Type</label>
                    <TileCarousel
                        options={carTypeOptions}
                        value={carForm.carType}
                        onChange={(id) => setCarField('carType', id as CarForm['carType'])}
                        ariaLabel='Car Types'
                    />
                </div>
            </div>

            <div className='pt-4'>
                <div>
                    <label className='block font-medium mb-2'>Rental Status</label>
                    <TileCarousel
                        options={rentalStatusOptions}
                        value={carForm.rentalStatus}
                        onChange={(id) => setCarField('rentalStatus', id as CarForm['rentalStatus'])}
                        ariaLabel='Rental Status'
                    />
                </div>
            </div>

            <div className='pt-2'>
                <div className='flex items-center justify-between'>
                    <div className='font-medium'>Mechanical/Electrical Issues</div>
                    <div>
                        <button className='w-32 px-4 py-2 bg-linear-65 from-[var(--muted2)] to-[var(--muted)] flex items-center justify-center gap-2' onClick={addWarningIndicator}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add
                        </button>
                    </div>
                </div>
                {carForm.warningLightIndicators.map((w, i) => (
                    <div key={w.id} className={`flex gap-2 items-center pt-2 transition-all duration-200 ${w.removing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <input placeholder='Issue' value={w.text} onChange={e => updateWarningIndicator(i, e.target.value)} className='p-2 flex-1' />
                        <button className='w-32 px-4 py-2 btn-danger text-white flex items-center justify-center gap-2' onClick={() => removeWarningIndicator(i)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {carForm.rentalStatus === 'rented' && (
                <div>
                    <hr className='my-4' />

                    <div className='text-lg font-semibold'>Rental Information</div>
                    <div className='pt-3'>
                        <label className='block'>Renter Name</label>
                        <input placeholder='John Doe' name='renterName' value={rentalForm.renterName} onChange={handleRentalChange} className='p-2 w-full' />
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block'>Renter Email</label>
                            <input placeholder='johndoe@email.com' name='renterEmail' value={rentalForm.renterEmail} onChange={handleRentalChange} className='p-2 w-full' />
                        </div>
                        <div>
                            <label className='block'>Renter Phone Number</label>
                            <input placeholder='1234567890' name='renterPhone' value={rentalForm.renterPhone} onChange={handleRentalChange} className='p-2 w-full' />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block'>Date Rented Out</label>
                            <input
                                type='date'
                                name='dateRentedOut'
                                value={rentalForm.dateRentedOut}
                                onChange={handleRentalChange}
                                className='p-2 w-full'
                            />
                        </div>
                        <div>
                            <label className='block'>Expected Return</label>
                            <input
                                type='date'
                                name='expectedReturnDate'
                                value={rentalForm.expectedReturnDate}
                                onChange={handleRentalChange}
                                className={`p-2 w-full ${!rentalForm.dateRentedOut ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                min={rentalForm.dateRentedOut || undefined}
                                disabled={!rentalForm.dateRentedOut}
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-3'>
                        <div>
                            <label className='block'>Rate Per Day</label>
                            <NumericInput
                                value={rentalForm.rentalRatePerDay}
                                onChange={(num) => setRentalField('rentalRatePerDay', num)}
                                allowDecimal
                                showCurrency
                                placeholder="$0.00"
                                className="p-2 w-full"
                                step={0.01}
                            />
                        </div>
                        <div>
                            <label className='block'>Actual Return</label>
                            <input
                                type='date'
                                name='actualReturnDate'
                                value={rentalForm.actualReturnDate}
                                onChange={handleRentalChange}
                                className={`p-2 w-full ${!rentalForm.dateRentedOut ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                min={rentalForm.dateRentedOut || undefined}
                                disabled={!rentalForm.dateRentedOut}
                            />
                        </div>
                    </div>

                    <div className='pt-3'>
                        <label className='block'>Notes</label>
                        <textarea placeholder='Additional information' name='notes' value={rentalForm.notes} onChange={handleRentalChange} className='p-2 w-full notes-textarea' rows={4} />
                    </div>
                </div>
            )}

            {errors.length > 0 && (
                <div className='text-left text-sm text-[var(--error-text)] pt-4'>
                    <ul>
                        {errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                </div>
            )}

            {isAdd ? (
                <div className='pt-6 text-center'>
                    <button className='w-1/2 mx-auto bg-linear-65 from-[var(--primary)] to-[var(--muted)] flex items-center justify-center gap-2' onClick={doSave} disabled={loading}>
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Car
                        </>
                    </button>
                </div>
            ) : (
                <div className='pt-6 grid grid-cols-2 gap-4'>
                    <button className='w-full btn-danger text-white flex items-center justify-center gap-2' onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete Car
                    </button>
                    <button className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)] flex items-center justify-center gap-2' onClick={doSave} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save Changes
                    </button>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this car and all associated rental records? This action cannot be undone."
                onConfirm={doDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                danger={true}
            />

            <ConfirmModal
                isOpen={showSuccessModal}
                title="Success"
                message={
                    <div className="text-[var(--success)] font-medium">
                        {message || (isAdd ? 'Car added successfully.' : 'Operation completed.')}
                    </div>
                }
                onConfirm={() => {
                    setShowSuccessModal(false);
                    if (redirectTimerRef.current) {
                        window.clearInterval(redirectTimerRef.current);
                        redirectTimerRef.current = undefined;
                    }
                    navigate('/cars');
                }}
                showCancel={false}
                confirmLabel="Go to Cars Now"
                footer={
                    <p className="text-sm text-[var(--muted-text)] text-center mt-2">
                        Redirecting to cars page in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </p>
                }
            />
        </div>
    );
}

export default ModifyCar;
