import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ServiceSelection from '../features/booking/ServiceSelection';
import Calendar from '../features/booking/Calendar';
import TimeSlots from '../features/booking/TimeSlots';
import BookingForm from '../features/booking/BookingForm';
import Button from '../components/common/Button';
import { ChevronLeft, Check } from 'lucide-react';

const steps = ['Servicio', 'Fecha', 'Hora', 'Tus Datos'];

const Booking = () => {
    const API_BASE_URL = '';
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [bookingData, setBookingData] = useState({
        service: null,
        date: null,
        time: null,
        userData: { name: '', email: '', phone: '', bikeModel: '' }
    });

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                // Clear local storage if we were using it for draft, or keep it as backup? 
                // Let's clear the tracking but maybe not the history itself if we want.
                // For now, simpler is better:
                navigate('/exito');
            } else {
                console.error('Error booking appointment');
                alert('Hubo un error al guardar tu reserva. Por favor intenta de nuevo.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Error de conexión con el servidor.');
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 0: return 'Elige el Servicio';
            case 1: return 'Selecciona una Fecha';
            case 2: return 'Elige un Horario';
            case 3: return 'Completa tus Datos';
            default: return '';
        }
    };

    const canProceed = () => {
        if (currentStep === 0) return !!bookingData.service;
        if (currentStep === 1) return !!bookingData.date;
        if (currentStep === 2) return !!bookingData.time;
        if (currentStep === 3) return bookingData.userData.name && bookingData.userData.email && bookingData.userData.phone;
        return false;
    };

    return (
        <div
            className="container"
            style={{
                paddingTop: '1rem',
                paddingBottom: '2rem',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 'calc(100vh - 100px)'
            }}
        >
            <div className="mb-10 w-full">
                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-10 relative w-full px-2 md:px-8">
                    {/* Background Line */}
                    <div className="absolute left-0 right-0 top-[1.25rem] h-1 bg-slate-800 -z-10 rounded-full mx-4" style={{ transform: 'translateY(-50%)' }} />

                    {/* Active Progress Line */}
                    <motion.div
                        className="absolute left-0 top-[1.25rem] h-1 -z-10 rounded-full mx-4"
                        style={{ background: 'var(--color-primary)', transform: 'translateY(-50%)' }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2" style={{ background: 'var(--color-bg)', padding: '0 0.5rem', minWidth: '70px', zIndex: 1 }}>
                            <div
                                className="rounded-full flex items-center justify-center font-bold border-2 transition-colors relative"
                                style={{
                                    width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                                    background: idx <= currentStep ? 'var(--color-primary)' : 'var(--color-surface)',
                                    borderColor: idx <= currentStep ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    color: idx <= currentStep ? 'white' : 'rgba(255,255,255,0.3)',
                                    zIndex: 2
                                }}
                            >
                                {idx < currentStep ? <Check size={18} /> : idx + 1}
                            </div>
                            <span className="text-xs md:text-sm font-medium text-center" style={{ color: idx <= currentStep ? 'white' : 'rgba(255,255,255,0.3)' }}>{step}</span>
                        </div>
                    ))}
                </div>

                <h2 className="text-3xl font-bold text-center mb-2">{getStepTitle()}</h2>
            </div>

            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start'
                }}
            >
                {currentStep === 0 && (
                    <ServiceSelection
                        selectedService={bookingData.service}
                        onSelect={(id) => setBookingData(prev => ({ ...prev, service: id }))}
                    />
                )}
                {currentStep === 1 && (
                    <Calendar
                        selectedDate={bookingData.date}
                        onSelect={(date) => setBookingData(prev => ({ ...prev, date }))}
                    />
                )}
                {currentStep === 2 && (
                    <TimeSlots
                        selectedDate={bookingData.date}
                        selectedTime={bookingData.time}
                        onSelect={(time) => setBookingData(prev => ({ ...prev, time }))}
                    />
                )}
                {currentStep === 3 && (
                    <BookingForm
                        formData={bookingData.userData}
                        onChange={(data) => setBookingData(prev => ({ ...prev, userData: data }))}
                    />
                )}
            </motion.div>

            {/* MEJORA CRÍTICA: Añadimos 'gap-8' y 'marginTop' explícito para garantizar separación vertical en móviles */}
            <div
                className="flex justify-between mt-auto"
                style={{
                    paddingTop: '2rem', // Espacio interno superior
                    marginTop: '3rem',  // Espacio externo mínimo garantizado contra el contenido
                    paddingBottom: '1rem' // Espacio inferior para no pegar al borde del navegador
                }}
            >
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
                >
                    <ChevronLeft size={20} /> Volver
                </Button>
                {currentStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!canProceed()}
                        style={{
                            opacity: !canProceed() ? 0.5 : 1,
                            cursor: !canProceed() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            filter: !canProceed() ? 'grayscale(1)' : 'grayscale(0)'
                        }}
                    >
                        Confirmar Reserva
                    </Button>
                ) : (
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed()}
                        style={{
                            opacity: !canProceed() ? 0.5 : 1,
                            cursor: !canProceed() ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Siguiente
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Booking;
