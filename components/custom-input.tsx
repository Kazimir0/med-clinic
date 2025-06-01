import React from 'react'
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
    }
}
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
