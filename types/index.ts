// Its used in record/doctors/page.tsx with the purpose of defining the types for the search parameters
export interface SearchParamsProps {
    searchParams?: Promise<{ [key: string]: string | undefined }>;
}