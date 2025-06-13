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
const RenderInput = ({ field, props }: { field: any; props: InputProps }) => {
    switch (props.type) {
        case "input":
            return (
                <FormControl>
                    <Input
                        type={props.inputType}
                        placeholder={props.placeholder}
                        {...field} />
                </FormControl>
            );
        case "select":
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
export const CustomInput = (props: InputProps) => {
    const { name, label, control, type } = props;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='w-full'>
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
}

// SwitchInput component allows to toggle the doctor's availability for each day of the week.
export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
    const handleChange = (day: string, field: any, value: string) => {
        setWorkSchedule((prevDays) => {
            // Check if the day already exists in the work schedule
            // If it does, update the field with the new value
            // If it doesn't, add a new entry for the day with the specified field and value
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
            {
                data?.map((el, id) => (
                    <div key={id} className='w-full flex items-center space-y-3 border-t border-t-gray-200 py-3'>
                        {/* Switch component: toggles whether the doctor is available to work on this specific day.
                        When switched ON, working hours are enabled for the day and default start time is set to 09:00. */}
                        <Switch id={el.value} className='data-[state=checked]:bg-blue-600 peer' onCheckedChange={e => handleChange(el.value, "start_time", "09:00",)} />

                        {/* Displays the name of the day (Monday, Tuesday,etc...) next to the switch*/}
                        <Label htmlFor={el.value} className='w-20 capitalize'>
                            {el.value}
                        </Label>

                        {/* This label is only visible when the switch is OFF.
                        It informs the user that the doctor is not scheduled to work on this day.
                        The label is automatically hidden when the switch is ON, using Tailwind's peer-data selector. */}
                        <Label htmlFor={el.value} className='text-gray-500 font-normal italic peer-data-[state=checked]:hidden pl-10'>
                            Not working on this day
                        </Label>

                        {/* Input fields for start and close time of the doctor's working hours on this day. */}
                        <div className='hidden peer-data-[state=checked]:flex items-center gap-2 pl-6'>
                            <Input name={`${el.label}.start_time`} type="time" defaultValue="09:00" onChange={e => handleChange(el.value, "start_time", e.target.value)} />
                            <Input name={`${el.label}.close_time`} type="time" defaultValue="17:00" onChange={e => handleChange(el.value, "close_time", e.target.value)} />
                        </div>
                    </div>
                ))}
        </div>
    )

}