import { useState, useCallback } from 'react';

export interface ScanState {
    isScanning: boolean;
    progress: number;
    message: string;
}

export const useSecurityScan = () => {
    const [scanState, setScanState] = useState<ScanState>({
        isScanning: false,
        progress: 0,
        message: '',
    });

    const startScan = useCallback((callback?: () => void) => {
        setScanState({ isScanning: true, progress: 0, message: 'Iniciando varredura profunda...' });

        const steps = [
            { p: 20, m: 'Analisando dependências de blueprints e esquemas...' },
            { p: 45, m: 'Validando integridade do manifesto de produção...' },
            { p: 70, m: 'Verificando clusters de orquestração e protocolos...' },
            { p: 90, m: 'Finalizando relatório de conformidade SSDLC...' },
            { p: 100, m: 'Varredura concluída com sucesso.' },
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                setScanState({
                    isScanning: true,
                    progress: step.p,
                    message: step.m,
                });

                if (index === steps.length - 1) {
                    setTimeout(() => {
                        setScanState((prev) => ({ ...prev, isScanning: false }));
                        if (callback) callback();
                    }, 1000);
                }
            }, (index + 1) * 1500);
        });
    }, []);

    return { ...scanState, startScan };
};
