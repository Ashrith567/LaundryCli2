import React, { createContext, useContext, ReactNode, useState } from 'react';

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  coords?: { latitude: number; longitude: number };
}

interface AddressContextType {
  addresses: Address[];
  currentAddress?: Address;
  addAddress: (addr: Address) => void;
  updateAddress: (addr: Address) => void;
  selectAddress: (id: string) => void;
}

const AddressContext = createContext<AddressContextType>({} as any);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);

  const addAddress = (addr: Address) => {
    setAddresses(prev => [...prev, addr]);
    setCurrentId(addr.id);
  };

  const updateAddress = (addr: Address) => {
    setAddresses(prev => prev.map(a => (a.id === addr.id ? addr : a)));
  };

  const selectAddress = (id: string) => {
    setCurrentId(id);
  };

  const currentAddress = addresses.find(a => a.id === currentId);

  return (
    <AddressContext.Provider value={{ addresses, currentAddress, addAddress, updateAddress, selectAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
