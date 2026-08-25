"use client";

import React, { createContext, useState, useCallback, useMemo, useContext } from 'react';
import { getLenis } from '@providers/LenisProvider';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    modalId: null,
    modalData: undefined
  });

  const openModal = useCallback((id, data) => {
    getLenis()?.stop();
    setState({
      isOpen: true,
      modalId: id,
      modalData: data
    });
  }, []);

  const closeModal = useCallback(() => {
    getLenis()?.start();
    setState({
      isOpen: false,
      modalId: null,
      modalData: undefined
    });
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    openModal,
    closeModal
  }), [state, openModal, closeModal]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}

const defaultContextValue = {
  isOpen: false,
  modalId: null,
  modalData: undefined,
  openModal: () => {},
  closeModal: () => {}
};

export function useModal() {
  return useContext(ModalContext) ?? defaultContextValue;
}
