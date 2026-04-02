import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const API_BASE_URL = '';
    const [settings, setSettings] = useState({
        businessName: 'CycleFix',
        adminPassword: 'admin123',
        businessLogo: 'bike'
    });
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings`);
            if (response.ok) {
                const result = await response.json();
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/services`);
            if (response.ok) {
                const result = await response.json();
                setServices(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchSettings(), fetchServices()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            if (response.ok) {
                await fetchSettings();
                return true;
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
        return false;
    };

    const updateService = async (id, updates) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (response.ok) {
                await fetchServices();
                return true;
            }
        } catch (error) {
            console.error('Error updating service:', error);
        }
        return false;
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, services, updateService, loading, fetchSettings, fetchServices }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
