import { cn } from '@/lib/utils'
import Image from 'next/image'
import { getInitials } from '@/utils';

// ProfileImage displays a user's profile image if available, or their initials with a colored background
// Props: url (image URL), name (for initials), className (optional), textClassName (optional), bgColor (optional)
export const ProfileImage = ({ url, name, className, textClassName, bgColor }: { url?: string, name: string, className?: string, textClassName?: string, bgColor?: string }) => {
    // If an image URL is provided, render the image
    if (url) return (
        <Image
            src={url}
            alt={name}
            height={40} width={40}
            className={cn("flex md:hidden lg:block w-10 h-10 rounded-full object-cover", className)}
        />
    );
    // Otherwise, render initials with a colored background
    if (name) {
        return (
            <div
                className={cn(
                    "flex md:hidden lg:flex w-10 h-10 rounded-full text-white text-base items-center justify-center font-light",
                    className
                )}
                style={{ backgroundColor: bgColor || "#2563eb" }}
            >
                <p className={textClassName}>{getInitials(name)}</p>
            </div>
        );
    }
};
