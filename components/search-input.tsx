"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

// SearchInput provides a search bar that updates the URL query string and triggers navigation
// Handles input state, query string management, and automatic reset on clear
const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");

  // Set initial value from query params (if present)
  useEffect(() => {
    const currentSearchParam = searchParams.get("q") || "";
    setSearchValue(currentSearchParam);
  }, [searchParams]);

  // Helper to create a query string with the updated search value
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name); // Remove param if value is empty
      }
      return params.toString();
    },
    [searchParams]
  );

  // Handle form submit to trigger search
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(pathname + (searchValue ? "?" + createQueryString("q", searchValue) : ""));
  };

  // Handle input change and auto-reset if cleared
  const handleInputChange = (value: string) => {
    setSearchValue(value);
    // If cleared, remove the search param and reset results
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