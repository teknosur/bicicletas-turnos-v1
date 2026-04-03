import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Calendar, Clock, User, Phone, Mail, Bike, Search, Filter, Edit3, CheckCircle, Printer, MessageCircle, Settings, Wrench, Shield, Zap, X, Save, Trash2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSettings } from '../context/SettingsContext';

const Admin = () => {
    const navigate = useNavigate();
    const { settings, updateSettings } = useSettings();
    const API_BASE_URL = '';
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isAdminLoggedIn') === 'true';
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterService, setFilterService] = useState('all');
    const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'completed', 'all'

    // Notes State (para feedback visual de guardado)
    const [savingNoteId, setSavingNoteId] = useState(null);

    // Modals State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { services } = useSettings();
    const [tempSettings, setTempSettings] = useState({
        businessName: '',
        adminPassword: '',
        businessLogo: ''
    });

    useEffect(() => {
        if (settings) {
            setTempSettings({
                businessName: settings.businessName || '',
                adminPassword: settings.adminPassword || '',
                businessLogo: settings.businessLogo || 'bike'
            });
        }
    }, [settings]);

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

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isAdminLoggedIn');
    };

    const fetchBookings = () => {
        fetch(`${API_BASE_URL}/api/bookings`)
            .then(res => {
                if (!res.ok) throw new Error('Error al cargar datos');
                return res.json();
            })
            .then(data => {
                setBookings(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        let interval;
        if (isLoggedIn) {
            fetchBookings();
            // Actualizar automáticamente cada 30 segundos
            interval = setInterval(fetchBookings, 30000);
        }
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const handleUpdateNote = async (id, newNote) => {
        // Optimistic update locally
        setBookings(prev => prev.map(b => b.id === id ? { ...b, adminNotes: newNote } : b));
        setSavingNoteId(id);

        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: newNote })
            });

            if (!res.ok) throw new Error('Failed to update');

            // Show success briefly
            setTimeout(() => setSavingNoteId(null), 1000);
        } catch (err) {
            console.error(err);
            setSavingNoteId(null);
        }
    };

    const handleUpdateBooking = async (id, updates) => {
        // Optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        setSavingNoteId(id); // Reusar para feedback visual

        try {
            const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) throw new Error('Failed to update');
            setTimeout(() => setSavingNoteId(null), 1000);
        } catch (err) {
            console.error(err);
            setSavingNoteId(null);
            fetchBookings(); // Recargar en caso de error
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        // Optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: newStatus } : b));

        try {
            await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: newStatus })
            });
        } catch (err) {
            console.error(err);
            // Revert on error
            setBookings(prev => prev.map(b => b.id === id ? { ...b, completed: currentStatus } : b));
        }
    };

    const handleDeleteBooking = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete');
                setBookings(prev => prev.filter(b => b.id !== id));
            } catch (err) {
                console.error(err);
                alert('Error al intentar eliminar el pedido.');
            }
        }
    };

    const handlePrintReport = (booking) => {
        const printWindow = window.open('', '_blank');
        const dateStr = formatDate(booking.date);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte de Servicio - #${booking.id}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                        .title { font-size: 24px; font-weight: bold; color: #1e293b; }
                        .id { font-size: 18px; color: #64748b; }
                        .section { margin-bottom: 25px; }
                        .section-title { font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
                        .data-row { display: flex; margin-bottom: 5px; }
                        .label { width: 120px; font-weight: bold; color: #475569; }
                        .value { flex: 1; }
                        .notes-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; white-space: pre-wrap; margin-top: 10px; min-height: 100px; }
                        .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="title">ORDEN DE SERVICIO</div>
                        <div class="id">ID: #${booking.id}</div>
                    </div>

                    <div class="section">
                        <div class="section-title">Datos del Cliente</div>
                        <div class="data-row"><div class="label">Nombre:</div><div class="value">${booking.clientName}</div></div>
                        <div class="data-row"><div class="label">Teléfono:</div><div class="value">${booking.clientPhone}</div></div>
                        <div class="data-row"><div class="label">Email:</div><div class="value">${booking.clientEmail}</div></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Detalles del Turno</div>
                        <div class="data-row"><div class="label">Servicio:</div><div class="value">${getServiceLabel(booking.serviceId)}</div></div>
                        <div class="data-row"><div class="label">Bicicleta:</div><div class="value">${booking.bikeModel || 'No especificado'}</div></div>
                        <div class="data-row"><div class="label">Fecha:</div><div class="value">${dateStr}</div></div>
                        <div class="data-row"><div class="label">Hora:</div><div class="value">${booking.time} Hs</div></div>
                    </div>

                    <div class="section">
                        <div class="section-title">Notas del Técnico</div>
                        <div class="notes-box">${booking.adminNotes || 'Sin notas adicionales registradas.'}</div>
                    </div>

                    <div class="footer">
                        ${settings.businessName} - Gestión de Taller Integral<br>
                        Documento generado el ${new Date().toLocaleString()}
                    </div>

                    <script>
                        window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleWhatsAppReminder = (booking) => {
        // Limpiar el número de teléfono (solo números)
        const cleanPhone = booking.clientPhone.replace(/\D/g, '');

        // Si el número no tiene el prefijo de país (asumiendo Argentina 54), se lo agregamos
        const phoneWithCountry = cleanPhone.length <= 10 ? `54${cleanPhone}` : cleanPhone;

        let message = "";
        if (booking.completed) {
            message = `Hola ${booking.clientName}, ¡tu bicicleta ya está lista! 🚲 Puedes pasar a retirarla por el taller ${settings.businessName}.`;
            if (booking.adminNotes) message += `\n\n*Notas del servicio:* ${booking.adminNotes}`;
        } else {
            message = `Hola ${booking.clientName}, te recordamos tu turno en ${settings.businessName} para el día ${formatDate(booking.date)} a las ${booking.time} Hs. ¡Te esperamos! 🚲`;
        }

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneWithCountry}?text=${encodedMsg}`, '_blank');
    };

    const handleExportExcel = () => {
        // Preparamos los datos para Excel
        const exportData = bookings.map(b => ({
            ID: b.id,
            Fecha: formatDate(b.date),
            Hora: b.time + " Hs",
            Cliente: b.clientName,
            Telefono: b.clientPhone,
            Email: b.clientEmail,
            Servicio: getServiceLabel(b.serviceId),
            Bicicleta: b.bikeModel || 'No especificada',
            Estado: b.completed ? 'Completado' : 'Pendiente',
            Notas: b.adminNotes || ''
        }));

        // Crear libro y hoja
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas");

        // Ajustar anchos de columna (opcional pero recomendado)
        const wscols = [
            { wch: 6 },  // ID
            { wch: 12 }, // Fecha
            { wch: 10 }, // Hora
            { wch: 20 }, // Cliente
            { wch: 15 }, // Telefono
            { wch: 25 }, // Email
            { wch: 20 }, // Servicio
            { wch: 20 }, // Bicicleta
            { wch: 12 }, // Estado
            { wch: 30 }  // Notas
        ];
        worksheet['!cols'] = wscols;

        // Descargar archivo
        XLSX.writeFile(workbook, `Reservas_Bicicletas_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Filtrado de datos
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toString().includes(searchTerm);

        const matchesService = filterService === 'all' || booking.serviceId === filterService;

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && !booking.completed) ||
            (filterStatus === 'completed' && !!booking.completed);

        return matchesSearch && matchesService && matchesStatus;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Si viene con T (ISO), tomamos solo la fecha
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        // Dividimos por el guion
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            // Reordenamos de YYYY-MM-DD a DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return cleanDate;
    };

    const getServiceLabel = (id) => {
        const service = services.find(s => s.id === id);
        return service ? service.title : id;
    };

    const getServiceColor = (id) => {
        switch (id) {
            case 'tuneup': return 'rgba(59, 130, 246, 0.2)';
            case 'flatfix': return 'rgba(16, 185, 129, 0.2)';
            case 'repair': return 'rgba(245, 158, 11, 0.2)';
            default: return 'rgba(148, 163, 184, 0.2)';
        }
    };

    const styles = `
        .admin-table-container {
            overflow-x: auto;
            background: rgba(15, 23, 42, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.3);
            backdrop-filter: blur(8px);
        }
        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        /* Mobile Stack Layout for Table */
        @media (max-width: 992px) {
            .admin-table thead {
                display: none; /* Hide headers on mobile */
            }
            .admin-table tr {
                display: block;
                margin-bottom: 1.5rem;
                padding: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.02);
            }
            .admin-table td {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                text-align: right;
            }
            .admin-table td:last-child {
                border-bottom: none;
            }
            .admin-table td::before {
                content: attr(data-label);
                font-size: 0.7rem;
                font-weight: 800;
                text-transform: uppercase;
                color: var(--color-text-muted);
                text-align: left;
                margin-right: 1rem;
                letter-spacing: 0.05em;
            }
            .admin-table .client-info {
                align-items: flex-end;
            }
            .admin-table .notes-input {
                text-align: left;
                width: 100%;
                margin-top: 0.5rem;
            }
            .admin-table td[data-label="Nota Interna"] {
                flex-direction: column;
                align-items: flex-start;
            }
            .admin-table td[data-label="Nota Interna"]::before {
                margin-bottom: 0.5rem;
            }
        }

        .admin-table th {
            text-align: left;
            padding: 1.25rem 1rem;
            color: var(--color-text-muted);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.03);
            white-space: nowrap;
        }
        .admin-table td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: var(--color-text);
            font-size: 0.95rem;
            vertical-align: middle;
        }
        .admin-table tr:last-child td {
            border-bottom: none;
        }
        .admin-table tr:hover td {
            background: rgba(255, 255, 255, 0.03);
        }
        .client-info {
             display: flex;
             flex-direction: column;
             gap: 0.25rem;
        }
        .client-sub {
            font-size: 0.8rem;
            color: var(--color-text-muted);
        }
        .editable-table-input {
            background: transparent;
            border: 1px solid transparent;
            color: inherit;
            font-family: 'Outfit', sans-serif;
            padding: 4px 8px;
            border-radius: 6px;
            transition: all 0.2s;
            width: 100%;
            display: block;
            margin-left: -8px; /* Offset padding to keep text aligned */
        }
        .editable-table-input:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }
        .editable-table-input:focus {
            background: rgba(15, 23, 42, 0.8);
            border-color: var(--color-primary);
            outline: none;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .service-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 99px;
            font-size: 0.8rem;
            font-weight: 600;
            white-space: nowrap;
        }
        .notes-input {
            width: 100%;
            background: transparent;
            border: 1px solid transparent;
            padding: 0.6rem;
            border-radius: 8px;
            color: #e2e8f0;
            font-size: 0.85rem;
            line-height: 1.4;
            transition: all 0.2s;
            font-family: inherit;
            display: block;
            scrollbar-width: thin;
        }
        .notes-input:hover {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
        }
        .notes-input:focus {
            background: rgba(15, 23, 42, 0.8);
            border-color: var(--color-primary);
            outline: none;
        }
        .notes-input::placeholder {
            color: rgba(148, 163, 184, 0.5);
            font-style: italic;
        }

        /* Search Input Styling */
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
        }
        .search-icon {
            position: absolute;
            left: 1rem;
            color: var(--color-text-muted);
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .search-input {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.8rem 1rem 0.8rem 3rem;
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
        .search-input::placeholder {
            color: var(--color-text-muted);
            opacity: 0.6;
        }

        /* Switch Styles */
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255,255,255,0.1);
            transition: .4s;
            border-radius: 34px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 4px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .slider {
            background-color: #10b981;
            border-color: #10b981;
        }
        input:checked + .slider:before {
            transform: translateX(24px);
            content: "✓";
            color: #10b981;
            font-weight: bold;
        }

        /* Segmented Control Styling */
        .status-segment-control {
            display: flex;
            background: rgba(15, 23, 42, 0.8);
            padding: 4px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            gap: 2px;
        }
        .segment-btn {
            padding: 0.6rem 1.25rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--color-text-muted);
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            background: transparent;
            white-space: nowrap;
        }
        .segment-btn:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.03);
        }
        .segment-btn.active {
            color: #fff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .segment-btn.active.pending {
            background: var(--color-primary);
        }
        .segment-btn.active.completed {
            background: #10b981;
        }
        .segment-btn.active.all {
            background: #475569;
        }

        .status-badge-count {
            display: flex;
            align-items: center;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
        }
        .status-badge-count .count-label {
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            color: var(--color-text-muted);
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.03em;
            background: rgba(255, 255, 255, 0.02);
        }

        .btn-delete:hover {
            color: #ef4444 !important;
            border-color: rgba(239, 68, 68, 0.2) !important;
            background: rgba(239, 68, 68, 0.1) !important;
        }

        .btn-whatsapp:hover {
            color: #22c55e !important;
            border-color: rgba(34, 197, 94, 0.2) !important;
            background: rgba(34, 197, 94, 0.1) !important;
        }

        .btn-print:hover {
            color: #eab308 !important;
            border-color: rgba(234, 179, 8, 0.2) !important;
            background: rgba(234, 179, 8, 0.1) !important;
        }
        .status-badge-count .count-value {
            padding: 0.5rem 1rem;
            font-size: 0.95rem;
            font-weight: 800;
            color: var(--color-primary);
            background: rgba(59, 130, 246, 0.1);
            min-width: 40px;
            text-align: center;
        }
    `;

    // Login View (Igual que antes)
    if (!isLoggedIn) {
        return (
            <div
                className="container mx-auto flex items-center justify-center"
                style={{
                    minHeight: '80vh',
                    paddingTop: '80px',
                    paddingLeft: '1rem',
                    paddingRight: '1rem'
                }}
            >
                <Card
                    className="p-8 relative overflow-hidden backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-[40px] -ml-10 -mb-10 pointer-events-none" />

                    <h2 className="text-3xl font-bold text-white mb-2 text-center relative z-10">Acceso Admin</h2>
                    <p className="text-muted text-center mb-8 text-sm relative z-10">Ingresa tus credenciales para gestionar reservas</p>

                    <form onSubmit={handleLogin} className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: '1rem',
                                    padding: '0.75rem 1rem'
                                }}
                                placeholder="ej. admin"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: '1rem',
                                    padding: '0.75rem 1rem'
                                }}
                                placeholder="••••••••"
                            />
                        </div>

                        {loginError && (
                            <div
                                style={{
                                    color: '#ff4d4d',
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(255, 77, 77, 0.1)',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(255, 77, 77, 0.2)',
                                    fontWeight: '600'
                                }}
                            >
                                {loginError}
                            </div>
                        )}

                        <div style={{ marginTop: '1rem' }}>
                            <Button type="submit" className="w-full justify-center text-lg shadow-xl shadow-primary/20">
                                Entrar al Panel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    if (loading) return <div className="text-white text-center mt-32">Cargando base de datos...</div>;
    if (error) return <div className="text-red-400 text-center mt-32">Error de conexión: {error}</div>;

    return (
        <div className="container mx-auto pt-32 pb-20 px-4">
            <style>{styles}</style>

            <div className="flex flex-col mb-10 gap-6">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-bold text-white">Panel de Administración</h1>
                        <p className="text-muted text-xs md:text-sm mt-1">Vista tabular de reservas</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                    <div className="status-segment-control w-full md:w-auto">
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`segment-btn flex-1 md:flex-none ${filterStatus === 'pending' ? 'active pending' : ''}`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFilterStatus('completed')}
                            className={`segment-btn flex-1 md:flex-none ${filterStatus === 'completed' ? 'active completed' : ''}`}
                        >
                            Completados
                        </button>
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`segment-btn flex-1 md:flex-none ${filterStatus === 'all' ? 'active all' : ''}`}
                        >
                            Todos
                        </button>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-5 w-full md:w-auto">
                        <span className="status-badge-count flex-1 md:flex-none">
                            <span className="count-label">Mostrando</span>
                            <span className="count-value">{filteredBookings.length}</span>
                        </span>

                        <div className="hidden md:block h-4 w-[1px] bg-white/10" />

                        <div className="flex items-center" style={{ gap: '15px' }}>
                            <Button
                                onClick={handleExportExcel}
                                variant="ghost"
                                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-accent transition-all flex items-center gap-1.5"
                                style={{ padding: '8px 12px' }}
                                title="Exportar a Excel (.xlsx)"
                            >
                                <FileSpreadsheet size={14} /> <span className="hidden lg:inline">Excel</span>
                            </Button>

                            <Button
                                onClick={() => setIsSettingsOpen(true)}
                                variant="ghost"
                                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-accent transition-all flex items-center gap-1.5"
                                style={{ padding: '8px 12px' }}
                                title="Ajustes del Negocio"
                            >
                                <Settings size={14} /> <span className="hidden sm:inline">Config</span>
                            </Button>

                            <Button
                                onClick={() => window.open('/admin/servicios', '_blank')}
                                variant="ghost"
                                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-primary transition-all flex items-center gap-1.5"
                                style={{ padding: '8px 12px' }}
                                title="Gestionar Servicios"
                            >
                                <Wrench size={14} /> <span className="hidden sm:inline">Servicios</span>
                            </Button>

                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-red-400 transition-all whitespace-nowrap"
                                style={{ padding: '8px 12px' }}
                            >
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="mb-12 grid gap-10 md:grid-cols-[1fr_auto]">
                <div className="search-container">
                    <div className="search-icon">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cliente, email o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="status-segment-control" style={{ overflowX: 'auto', display: 'flex', gap: '0.5rem', paddingBottom: '0.25rem' }}>
                    <button
                        onClick={() => setFilterService('all')}
                        className={`segment-btn ${filterService === 'all' ? 'active all' : ''}`}
                        style={{ flexShrink: 0 }}
                    >
                        Todos
                    </button>
                    {services.map(service => (
                        <button
                            key={service.id}
                            onClick={() => setFilterService(service.id)}
                            className={`segment-btn ${filterService === service.id ? 'active all' : ''}`}
                            style={{ flexShrink: 0 }}
                        >
                            {service.title.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-white/5 mt-4">
                    <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="text-muted" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No se encontraron reservas</h3>
                    <p className="text-muted">Intenta ajustar tus filtros de búsqueda</p>
                </div>
            ) : (
                <div className="admin-table-container mt-8">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Cliente</th>
                                <th>Servicio</th>
                                <th style={{ minWidth: '140px' }}>Fecha</th>
                                <th style={{ minWidth: '180px' }}>Nota Interna</th>
                                <th style={{ width: '100px', textAlign: 'center' }}>Estado</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td data-label="ID" className="text-muted font-mono">#{booking.id}</td>
                                    <td data-label="Cliente">
                                        <div className="client-info">
                                            <input
                                                type="text"
                                                className="editable-table-input font-bold text-white"
                                                defaultValue={booking.clientName}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && val !== booking.clientName) {
                                                        handleUpdateBooking(booking.id, { clientName: val });
                                                    }
                                                }}
                                            />
                                            <input
                                                type="text"
                                                className="editable-table-input client-sub"
                                                defaultValue={booking.clientPhone}
                                                onBlur={(e) => {
                                                    const val = e.target.value.trim();
                                                    if (val && val !== booking.clientPhone) {
                                                        handleUpdateBooking(booking.id, { clientPhone: val });
                                                    }
                                                }}
                                            />
                                            <span className="client-sub text-xs opacity-75" style={{ paddingLeft: '8px' }}>{booking.clientEmail}</span>
                                        </div>
                                    </td>
                                    <td data-label="Servicio">
                                        <div className="flex flex-col gap-2 md:items-start items-end">
                                            <span
                                                className="service-badge w-fit"
                                                style={{
                                                    backgroundColor: getServiceColor(booking.serviceId),
                                                    color: booking.serviceId === 'tuneup' ? '#60a5fa' :
                                                        booking.serviceId === 'flatfix' ? '#34d399' : '#fbbf24',
                                                    border: `1px solid ${getServiceColor(booking.serviceId).replace('0.2', '0.3')}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {getServiceLabel(booking.serviceId)}
                                            </span>
                                            <div className="flex items-center gap-1 text-muted text-xs w-full">
                                                <Bike size={12} className="shrink-0" />
                                                <input
                                                    type="text"
                                                    className="editable-table-input text-muted text-xs"
                                                    defaultValue={booking.bikeModel || ''}
                                                    placeholder="Modelo bici..."
                                                    onBlur={(e) => {
                                                        const val = e.target.value.trim();
                                                        if (val !== (booking.bikeModel || '')) {
                                                            handleUpdateBooking(booking.id, { bikeModel: val });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Fecha">
                                        <div className="client-info">
                                            <span className="font-medium text-white">
                                                {formatDate(booking.date)}
                                            </span>
                                            <span className="client-sub text-accent font-bold">{booking.time} Hs</span>
                                        </div>
                                    </td>
                                    <td data-label="Nota Interna">
                                        {/* Editable Note Cell - TextArea */}
                                        <div className="relative w-full">
                                            <textarea
                                                className="notes-input scrollbar-hide"
                                                placeholder="+ Agregar nota..."
                                                defaultValue={booking.adminNotes || ''}
                                                rows={2}
                                                style={{
                                                    resize: 'vertical',
                                                    minHeight: '40px',
                                                    background: booking.adminNotes ? 'rgba(255,255,255,0.03)' : 'transparent',
                                                    fieldSizing: 'content'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.background = 'rgba(15, 23, 42, 0.9)';
                                                    e.target.style.borderColor = 'var(--color-primary)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.background = e.target.value ? 'rgba(255,255,255,0.03)' : 'transparent';
                                                    e.target.style.borderColor = 'transparent';

                                                    const val = e.target.value.trim();
                                                    if (val !== (booking.adminNotes || '')) {
                                                        handleUpdateNote(booking.id, val);
                                                    }
                                                }}
                                            />
                                            {savingNoteId === booking.id && (
                                                <div className="absolute right-2 top-2 text-accent pointer-events-none z-50">
                                                    <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td data-label="Estado" style={{ textAlign: 'center' }}>
                                        <div className="flex flex-col items-center gap-1">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={!!booking.completed}
                                                    onChange={() => handleToggleStatus(booking.id, !!booking.completed)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                textTransform: 'uppercase',
                                                fontWeight: 'bold',
                                                color: booking.completed ? '#10b981' : 'var(--color-text-muted)',
                                                marginTop: '4px'
                                            }}>
                                                {booking.completed ? 'Terminado' : 'Pendiente'}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="Acciones" style={{ textAlign: 'center' }}>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handlePrintReport(booking)}
                                                className="p-2 opacity-60 btn-print transition-all"
                                                title="Imprimir Orden"
                                            >
                                                <Printer size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleWhatsAppReminder(booking)}
                                                className="p-2 opacity-60 btn-whatsapp transition-all"
                                                title="Enviar WhatsApp"
                                            >
                                                <MessageCircle size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                className="p-2 opacity-60 btn-delete transition-all"
                                                title="Eliminar Pedido"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Config Modal - Business Settings */}
            {isSettingsOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4"
                    style={{
                        zIndex: 9999,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div className="absolute inset-0" onClick={() => setIsSettingsOpen(false)} />
                    <Card
                        className="relative z-10 glass border-white/10 bg-slate-900/95 shadow-2xl custom-scrollbar"
                        style={{
                            width: '90%',
                            maxWidth: '500px',
                            margin: 'auto',
                            maxHeight: '85vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Settings className="text-accent" /> Datos del Negocio
                            </h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-muted hover:text-white transition-colors p-1">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted tracking-widest">Nombre del Negocio</label>
                                <input
                                    type="text"
                                    className="search-input"
                                    style={{ paddingLeft: '1rem', width: '100%' }}
                                    value={tempSettings.businessName}
                                    onChange={(e) => setTempSettings({ ...tempSettings, businessName: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted tracking-widest">Contraseña Admin</label>
                                <input
                                    type="password"
                                    className="search-input"
                                    style={{ paddingLeft: '1rem', width: '100%' }}
                                    value={tempSettings.adminPassword}
                                    onChange={(e) => setTempSettings({ ...tempSettings, adminPassword: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase text-muted tracking-widest">Icono del Logo Superior</label>
                                <div
                                    className="bg-white/5 rounded-xl border border-white/5"
                                    style={{ display: 'flex', flexDirection: 'row', gap: '12px', padding: '12px', justifyContent: 'flex-start', flexWrap: 'wrap' }}
                                >
                                    {[
                                        { id: 'bike', icon: Bike },
                                        { id: 'wrench', icon: Wrench },
                                        { id: 'shield', icon: Shield },
                                        { id: 'zap', icon: Zap }
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setTempSettings({ ...tempSettings, businessLogo: item.id })}
                                            className="transition-all flex justify-center items-center"
                                            style={{
                                                padding: '12px', borderRadius: '8px', width: '50px', height: '50px',
                                                backgroundColor: tempSettings.businessLogo === item.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                                color: tempSettings.businessLogo === item.id ? 'white' : 'var(--color-text-muted)',
                                                border: 'none', cursor: 'pointer', transform: tempSettings.businessLogo === item.id ? 'scale(1.1)' : 'scale(1)'
                                            }}
                                        >
                                            <item.icon size={24} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-32">
                                <Button
                                    className="flex-1 justify-center py-4 font-bold"
                                    onClick={async () => {
                                        const success = await updateSettings(tempSettings);
                                        if (success) setIsSettingsOpen(false);
                                    }}
                                >
                                    <Save size={18} /> Guardar Cambios del Negocio
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default Admin;
