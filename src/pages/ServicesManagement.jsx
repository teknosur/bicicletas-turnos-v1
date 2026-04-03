import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Wrench, Bike, Zap, X, Save, ArrowLeft } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const ServicesManagement = () => {
    const { settings, services, updateService } = useSettings();
    const navigate = useNavigate();
    
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isAdminLoggedIn') === 'true';
    });
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [tempServices, setTempServices] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (services) {
            setTempServices(services);
        }
    }, [services]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'admin' && password === settings.adminPassword) {
            setIsLoggedIn(true);
            localStorage.setItem('isAdminLoggedIn', 'true');
            setLoginError('');
        } else {
            setLoginError('Credenciales incorrectas');
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const servicePromises = tempServices.map(s => updateService(s.id, s));
            await Promise.all(servicePromises);
            alert('Servicios actualizados correctamente');
        } catch (err) {
            console.error(err);
            alert('Error al guardar los servicios');
        } finally {
            setIsSaving(false);
        }
    };

    const styles = `
        .services-manager-container {
            max-width: 800px;
            margin: 0 auto;
            padding-top: 100px;
            padding-bottom: 50px;
            padding-left: 1rem;
            padding-right: 1rem;
        }
        .service-card {
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(8px);
            transition: all 0.3s ease;
        }
        .service-card:hover {
            border-color: rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.6);
        }
        .search-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.8rem 1rem;
            color: white;
            font-family: 'Outfit', sans-serif;
            transition: all 0.2s;
        }
        .search-input:focus {
            outline: none;
            border-color: var(--color-primary);
            background: rgba(15, 23, 42, 0.8);
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto flex items-center justify-center min-h-[80vh] pt-32 px-4 text-white">
                <style>{styles}</style>
                <Card className="p-8 w-full max-w-md bg-slate-900/60 border-white/10 shadow-2xl backdrop-blur-xl">
                    <h2 className="text-3xl font-bold mb-2 text-center">Gestión de Servicios</h2>
                    <p className="text-muted text-center mb-8 text-sm">Acceso administrativo requerido</p>
                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Usuario</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="search-input" placeholder="admin" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="search-input" placeholder="••••••••" />
                        </div>
                        {loginError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center font-bold">{loginError}</div>}
                        <Button type="submit" className="w-full justify-center py-3">Entrar</Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="services-manager-container">
            <style>{styles}</style>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-2 text-sm font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft size={16} /> Volver al Panel
                    </button>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Gestión de Servicios</h1>
                    <p className="text-muted text-sm mt-1">Configura los precios y detalles de lo que ofreces</p>
                </div>
                
                <Button 
                    onClick={handleSaveAll} 
                    disabled={isSaving}
                    className="shadow-lg shadow-primary/20 py-3 px-8 font-bold"
                >
                    <Save size={18} /> {isSaving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                </Button>
            </div>

            <div className="flex flex-col gap-8">
                {tempServices.map((service, sIdx) => (
                    <div key={service.id} className="service-card group">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                    {sIdx + 1}
                                </span>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                                    {service.title || 'Nuevo Servicio'}
                                </h3>
                            </div>
                            
                            <div className="flex gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-white/5">
                                {[
                                    { id: 'bike', icon: Bike },
                                    { id: 'wrench', icon: Wrench },
                                    { id: 'zap', icon: Zap }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            const newServs = [...tempServices];
                                            newServs[sIdx] = { ...newServs[sIdx], icon: item.id };
                                            setTempServices(newServs);
                                        }}
                                        className={`p-2 rounded-lg transition-all ${service.icon === item.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white hover:bg-white/10'}`}
                                        title={`Icono ${item.id}`}
                                    >
                                        <item.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-muted tracking-widest pl-1">Título del Servicio</label>
                                    <input
                                        className="search-input text-lg font-medium"
                                        value={service.title}
                                        onChange={(e) => {
                                            const newServs = [...tempServices];
                                            newServs[sIdx] = { ...newServs[sIdx], title: e.target.value };
                                            setTempServices(newServs);
                                        }}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase text-muted tracking-widest pl-1">Descripción</label>
                                    <textarea
                                        className="search-input min-h-[100px] leading-relaxed"
                                        style={{ resize: 'none' }}
                                        value={service.description}
                                        onChange={(e) => {
                                            const newServs = [...tempServices];
                                            newServs[sIdx] = { ...newServs[sIdx], description: e.target.value };
                                            setTempServices(newServs);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted tracking-widest pl-1">Precio</label>
                                <input
                                    className="search-input text-2xl font-black text-white"
                                    value={service.price}
                                    onChange={(e) => {
                                        const newServs = [...tempServices];
                                        newServs[sIdx] = { ...newServs[sIdx], price: e.target.value };
                                        setTempServices(newServs);
                                    }}
                                />
                                <p className="text-[10px] text-muted italic mt-2 px-1">Tip: Formato sugerido: "15.000"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 flex justify-center">
                 <Button 
                    onClick={handleSaveAll} 
                    disabled={isSaving}
                    className="w-full md:w-auto min-w-[300px] shadow-2xl shadow-primary/30 py-5 text-xl font-black"
                >
                    <Save size={24} /> {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </Button>
            </div>
        </div>
    );
};

export default ServicesManagement;
