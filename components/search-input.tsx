"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useState, useEffect } from "react";

const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  // Preluăm valoarea inițială din query params (dacă există)
  useEffect(() => {
    const currentSearchParam = searchParams.get("q") || "";
    setSearchValue(currentSearchParam);
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name); // Eliminăm parametrul când valoarea este goală
      }

      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(pathname + (searchValue ? "?" + createQueryString("q", searchValue) : ""));
  };

  // Funcția care se declanșează la schimbarea valorii în input
  const handleInputChange = (value: string) => {
    setSearchValue(value);
    
    // Dacă valoarea devine goală, resetăm căutarea automat
      if (value === "" && searchParams.has("q")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      const newQueryString = params.toString();
      router.push(pathname + (newQueryString ? "?" + newQueryString : ""));
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <div className="hidden xl:flex items-center border border-gray-300 px-2 py-2 rounded-md focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300">
        <Search size={18} className="text-gray-400" />
        <input
          className="outline-none px-2 text-sm"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
        />
      </div>
    </form>
  );
};

export default SearchInput;