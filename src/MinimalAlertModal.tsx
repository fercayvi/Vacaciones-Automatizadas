import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MinimalAlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  buttonText?: string;
}

export const MinimalAlertModal: React.FC<MinimalAlertModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
  buttonText = 'Entendido',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all">
        {/* Ícono grande y limpio en el centro superior */}
        <div className="flex justify-center mb-4">
          {type === 'success' && (
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
              <XCircle className="w-7 h-7" />
            </div>
          )}
          {type === 'info' && (
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Info className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Título en text-lg font-semibold text-gray-800 */}
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>

        {/* Mensaje en text-sm text-gray-500 mt-2 */}
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          {message}
        </p>

        {/* Botón único en la parte inferior */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default MinimalAlertModal;
