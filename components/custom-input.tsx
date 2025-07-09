import React from 'react'
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

interface InputProps {
    type: "input" | "textarea" | "select" | "checkbox" | "radio" | "switch";
    control: Control<any>;
    name: string;
    label?: string;
    placeholder?: string;
    inputType?: "text" | "email" | "password" | "date";
    selectList?: { label: string; value: string }[];
    defaultValue?: string;
}

// CustomInput is a flexible form input component supporting input, textarea, select, checkbox, radio, and switch types.
// It integrates with react-hook-form for validation and state management.
const RenderInput = ({ field, props }: { field: any; props: InputProps }) => {
    switch (props.type) {
        case "input":
            // Render a standard text/email/password/date input
            return (
                <FormControl>
                    <Input
                        type={props.inputType}
                        placeholder={props.placeholder}
                        {...field} />
                </FormControl>
            );
        case "select":
            // Render a dropdown select input
            return (
                <Select onValueChange={field.onChange} value={field?.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={props.placeholder} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {props.selectList?.map((i, id) => (
                            <SelectItem key={id} value={i.value}>
                                {i.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case "checkbox":
            // Render a checkbox with label and description
            return (
                <div className="items-top flex space-x-2">
                    <Checkbox
                        id={props.name}
                        onCheckedChange={(e) => field.onChange(e === true || null)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor={props.name}
                            className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {props.label}
                        </label>
                        <p className="text-sm text-muted-foreground">{props.placeholder}</p>
                    </div>
                </div>
            );
        case "radio":
            // Render a radio group for multiple options
            return (
                <div className="w-full">
                    <FormLabel>{props.label}</FormLabel>
                    <RadioGroup
                        defaultValue={props.defaultValue}
                        onChange={field.onChange}
                        className="flex gap-4"
                    >
                        {props?.selectList?.map((i, id) => (
                            <div className="flex items-center w-full" key={id}>
                                <RadioGroupItem
                                    value={i.value}
                                    id={i.value}
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor={i.value}
                                    className="flex flex-1 items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-600"
                                >
                                    {i.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            );
        case "textarea":
            // Render a textarea input
            return (
                <FormControl>
                    <Textarea
                        type={props.inputType}
                        placeholder={props.placeholder}
                        {...field}
                    ></Textarea>
                </FormControl>
            );
    }
};

// Main CustomInput component for use in forms
export const CustomInput = (props: InputProps) => {
    const { name, label, control, type } = props;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='w-full'>
                    {/* Show label for all types except radio and checkbox */}
                    {type !== "radio" && type !== "checkbox" && (
                        <FormLabel>{label}</FormLabel>
                    )}
                    <RenderInput field={field} props={props} />
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

type Day = {
    day: string;
    start_time?: string;
    close_time?: string;
};
interface SwitchProps {
    data: { label: string; value: string }[];
    setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
    workSchedule: Day[]; // Adaugă workSchedule ca prop
}

// SwitchInput manages a weekly work schedule using switches and time pickers for each day.
// It updates the workSchedule state based on user interaction.
export const SwitchInput = ({ data, setWorkSchedule, workSchedule }: SwitchProps) => {
    const handleChange = (day: string, field: any, value: string) => {
        setWorkSchedule((prevDays) => {
            const dayExists = prevDays.find((d) => d.day === day);

            if (dayExists) {
                return prevDays.map((d) => d.day === day ? { ...d, [field]: value } : d);
            } else {
                if (field === "start_time") {
                    return [
                        ...prevDays,
                        { day, start_time: value, close_time: "17:00" }
                    ];
                } if (field === "close_time") {
                    return [
                        ...prevDays,
                        { day, start_time: "09:00", close_time: value }
                    ];
                }
                return [...prevDays, { day, [field]: value }];
            }
        });
    }

    return (
        <div>
            {/* Render a switch and time pickers for each day in the week */}
            {
                data?.map((el, id) => {
                    // Find if the current day is in the work schedule
                    const currentDay = workSchedule.find(d => d.day === el.value);
                    
                    return (
                        <div key={id} className='w-full flex items-center space-y-3 border-t border-t-gray-200 py-3'>
                            <Switch 
                                id={el.value} 
                                className='data-[state=checked]:bg-blue-600 peer' 
                                checked={!!currentDay} 
                                onCheckedChange={checked => {
                                    if (checked) {
                                        handleChange(el.value, "start_time", "09:00");
                                    } else {
                                        setWorkSchedule(prev => prev.filter(d => d.day !== el.value));
                                    }
                                }} 
                            />
                            <Label htmlFor={el.value} className='w-20 capitalize'>
                                {el.value}
                            </Label>
                            <Label htmlFor={el.value} className='text-gray-500 font-normal italic peer-data-[state=checked]:hidden pl-10'>
                                Not working on this day
                            </Label>
                            <div className='hidden peer-data-[state=checked]:flex items-center gap-2 pl-6'>
                                <Input 
                                    name={`${el.label}.start_time`} 
                                    type="time" 
                                    value={currentDay?.start_time || "09:00"}
                                    onChange={e => handleChange(el.value, "start_time", e.target.value)} 
                                />
                                <Input 
                                    name={`${el.label}.close_time`} 
                                    type="time" 
                                    value={currentDay?.close_time || "17:00"}
                                    onChange={e => handleChange(el.value, "close_time", e.target.value)} 
                                />
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}