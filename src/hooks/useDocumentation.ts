import { useState, useCallback } from 'react';
import type { DocPage } from '../modules/documentation/types/documentation.types';
import { SecurityMiddleware } from '../utils/securityMiddleware';
import { INITIAL_DOCS } from '../constants/templates';

/**
 * Hook for managing documentation pages
 */
export const useDocumentation = (showToast: (msg: string, type?: any) => void) => {
    const [docPages, setDocPages] = useState<DocPage[]>([]);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    const handleSaveDocPage = useCallback((updatedPage: DocPage) => {
        setDocPages(prevPages => {
            const newPages = prevPages.some(p => p.id === updatedPage.id)
                ? prevPages.map(p => p.id === updatedPage.id ? updatedPage : p)
                : [...prevPages, updatedPage];

            SecurityMiddleware.secureWrite('atlas_documentation_pages', JSON.stringify(newPages));
            return newPages;
        });
        showToast(`Protocol "${updatedPage.title}" synchronized`, 'success');
    }, [showToast]);

    const loadDocumentation = useCallback(() => {
        const savedDocs = localStorage.getItem('atlas_documentation_pages');
        if (savedDocs) {
            try {
                const parsed = JSON.parse(savedDocs);
                setDocPages(parsed);
                return parsed;
            } catch (e) {
                setDocPages(INITIAL_DOCS);
            }
        } else {
            setDocPages(INITIAL_DOCS);
        }
        return INITIAL_DOCS;
    }, []);

    return {
        docPages,
        setDocPages,
        isDocModalOpen,
        setIsDocModalOpen,
        handleSaveDocPage,
        loadDocumentation
    };
};
