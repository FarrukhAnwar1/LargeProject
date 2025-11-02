import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { buildPath } from '../Path';
import ConfirmModal from './ConfirmModal';
import TileCarousel from './TileCarousel';

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
    registrationNumber: string;
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
};

const emptyCar: CarForm = {
    licensePlate: '', year: '', color: '', make: '', model: '', mileage: 0, registrationNumber: '', carType: 'sedan', rentalStatus: 'available', warningLightIndicators: []
};

const emptyRental: RentalForm = {
    renterName: '', renterEmail: '', renterPhone: '', dateRentedOut: '', expectedReturnDate: '', rentalRatePerDay: 0, notes: '', actualReturnDate: ''
};

const ModifyCar = ({ carId }: ModifyCarProps) => {
    const isAdd = carId === 'add' || !carId;
    const [carForm, setCarForm] = useState<CarForm>(emptyCar);
    const [rentalForm, setRentalForm] = useState<RentalForm>(emptyRental);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [errors, setErrors] = useState<string[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
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

    useEffect(() => {
        if (!isAdd && carId) {
            // Placeholder: fetch car and its current rental (if any)
            (async () => {
                setLoading(true);
                try {
                    // Example: GET /api/cars/:id
                    const carRes = await axios.get(buildPath(`api/car/${carId}`));
                    const car = carRes.data?.car;
                    if (car) {
                        setCarForm({
                            licensePlate: car.licensePlate ?? '',
                            year: car.year?.toString() ?? '',
                            color: car.color ?? '',
                            make: car.make ?? '',
                            model: car.model ?? '',
                            mileage: car.mileage != null ? Number(car.mileage) : 0,
                            registrationNumber: car.registrationNumber ?? '',
                            carType: car.carType ?? 'sedan',
                            warningLightIndicators: Array.isArray(car.warningLightIndicators) ? car.warningLightIndicators : [],
                            rentalStatus: car.rentalStatus ?? 'available'
                        });
                    }

                    // Example: GET /api/rentals?carId=:id to get latest rental
                    const rentRes = await axios.get(buildPath(`api/rental?carId=${carId}`));
                    const rental = rentRes.data?.rental;
                    if (rental) {
                        setRentalForm({
                            renterName: rental.renterName ?? '',
                            renterEmail: rental.renterEmail ?? '',
                            renterPhone: rental.renterPhone ?? '',
                            dateRentedOut: rental.dateRentedOut ? new Date(rental.dateRentedOut).toISOString().slice(0, 10) : '',
                            expectedReturnDate: rental.expectedReturnDate ? new Date(rental.expectedReturnDate).toISOString().slice(0, 10) : '',
                            actualReturnDate: rental.actualReturnDate ? new Date(rental.actualReturnDate).toISOString().slice(0, 10) : '',
                            rentalRatePerDay: rental.rentalRatePerDay != null ? Number(rental.rentalRatePerDay) : 0,
                            notes: rental.notes ?? ''
                        });
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
            const n = value === '' ? 0 : Number(value.replace(/^0+/, '')); // Remove leading zeros
            if (!Number.isNaN(n)) {
                setRentalField(name, n as RentalForm[typeof name]);
            }
            return;
        }
        
        setRentalField(name, value as unknown as RentalForm[typeof name]);
    };

    const validate = (): boolean => {
        const errs: string[] = [];
        if (!carForm.licensePlate || carForm.licensePlate.trim().length < 2) errs.push('License plate is required (min 2 chars).');
        const yearNum = Number(carForm.year);
        if (!carForm.year || Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) errs.push('Enter a valid year.');
        if (!carForm.make) errs.push('Make is required.');
        if (!carForm.model) errs.push('Model is required.');
        if (!carForm.color || carForm.color.trim().length === 0) errs.push('Color is required.');
        if (!carForm.registrationNumber) errs.push('Registration number is required.');
        const mileageNum = carForm.mileage;
        if (Number.isNaN(mileageNum) || mileageNum < 0) errs.push('Mileage must be a non-negative number.');

        // Rental: if renter name filled, require email and dates
        if (rentalForm.renterName) {
            if (!rentalForm.renterEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rentalForm.renterEmail)) errs.push('Valid renter email is required when renter name is provided.');
            if (!rentalForm.dateRentedOut) errs.push('Rental start date is required when renter is provided.');
            if (!rentalForm.expectedReturnDate) errs.push('Expected return date is required when renter is provided.');
            // actualReturnDate is optional
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
                registrationNumber: carForm.registrationNumber.trim(),
                carType: carForm.carType,
                warningLightIndicators: carForm.warningLightIndicators.map(i => i.text),
                rentalStatus: carForm.rentalStatus
            };

            if (isAdd) {
                // POST /api/car
                await axios.post(buildPath('api/car'), carPayload, { headers: { 'Content-Type': 'application/json' } });
                setMessage('Car added successfully.');
            } else {
                // PUT /api/car/:id
                await axios.put(buildPath(`api/car/${carId}`), carPayload, { headers: { 'Content-Type': 'application/json' } });
                setMessage('Car updated successfully.');
            }

            // Handle rental: if renter provided, create/update rental
            if (rentalForm.renterName) {
                const rentalPayload = {
                    renterName: rentalForm.renterName.trim(),
                    renterEmail: rentalForm.renterEmail.trim(),
                    renterPhone: rentalForm.renterPhone.trim(),
                    dateRentedOut: rentalForm.dateRentedOut,
                    expectedReturnDate: rentalForm.expectedReturnDate,
                    actualReturnDate: rentalForm.actualReturnDate || undefined,
                    rentalRatePerDay: rentalForm.rentalRatePerDay,
                    notes: rentalForm.notes?.trim()
                };

                if (isAdd) {
                    // POST /api/rental (backend should associate carID)
                    await axios.post(buildPath('api/rental'), { ...rentalPayload, carLicensePlate: carForm.licensePlate }, { headers: { 'Content-Type': 'application/json' } });
                } else {
                    // POST or PUT depending on backend; placeholder calls:
                    await axios.post(buildPath('api/rental'), { ...rentalPayload, carId }, { headers: { 'Content-Type': 'application/json' } });
                }
            }
        } catch (err) {
            console.error(err);
            if (err instanceof AxiosError && err?.response?.data?.message) {
                setMessage(err.response.data.message);
            } else {
                setMessage('An error occurred while saving.');
            }
        } finally {
            setLoading(false);
        }
    };

    const doDelete = async () => {
        if (!carId) return setMessage('No car selected to delete.');
        setLoading(true);
        setMessage('');
        try {
            // DELETE rental(s) for car (placeholder)
            await axios.delete(buildPath(`api/rental/car/${carId}`));
            // DELETE car
            await axios.delete(buildPath(`api/car/${carId}`));
            setMessage('Car and associated rentals deleted.');
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
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
                        <path d="M21 12H5M12 19l-7-7 7-7"/>
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
                    <input type="number" min="1900" max={new Date().getFullYear() + 1} name='year' value={carForm.year} onChange={handleCarChange} className='p-2 w-full' placeholder='2025' />
                </div>
                <div>
                    <label className='block font-medium'>Mileage</label>
                    <input 
                        type="number" 
                        min="0" 
                        name='mileage' 
                        value={carForm.mileage || ''} 
                        onChange={handleCarChange} 
                        className='p-2 w-full'
                        placeholder="0"
                        onFocus={(e) => e.target.value === '0' && e.target.select()}
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
                    <label className='block font-medium'>Registration Number</label>
                    <input placeholder='ABC-D12' name='registrationNumber' value={carForm.registrationNumber} onChange={handleCarChange} className='p-2 w-full' />
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
                            <label className='block'>Rate Per Day ($)</label>
                            <input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                placeholder="0"
                                name='rentalRatePerDay' 
                                value={rentalForm.rentalRatePerDay || ''} 
                                onChange={handleRentalChange} 
                                className='p-2 w-full'
                                onFocus={(e) => e.target.value === '0' && e.target.select()}
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
                        {isAdd ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Add Car
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className='pt-6 grid grid-cols-2 gap-4'>
                    <button className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)] flex items-center justify-center gap-2' onClick={doSave} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save Changes
                    </button>
                    <button className='w-full btn-danger text-white flex items-center justify-center gap-2' onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete Car
                    </button>
                </div>
            )}

            <div className='text-center pt-4'>
                <span id="modifyCarResult" className='font-medium text-[var(--error-text)]'>{message}</span>
            </div>
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
                message={message || (isAdd ? 'Car added successfully.' : 'Operation completed.')}
                onConfirm={() => setShowSuccessModal(false)}
                showCancel={false}
                confirmLabel="Close"
            />
        </div>
    );
}

export default ModifyCar;
