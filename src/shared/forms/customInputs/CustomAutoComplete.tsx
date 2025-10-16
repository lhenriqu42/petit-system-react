import { Autocomplete, TextField } from "@mui/material";
import { useRef, useState } from "react";

interface IAutoCompleteProps {
	options: { id: number; label: string }[];
	required?: boolean;
	label?: string;
	size?: 'small' | 'medium';
	minWidth?: number;
}

export const CustomAutoComplete: React.FC<IAutoCompleteProps> = ({ options, required, size = 'medium', label, minWidth }) => {
	const [selected, setSelected] = useState<{ id: number; label: string }>({ id: -1, label: '' });
	
	const inputRef = useRef<HTMLInputElement>(null);
	
	const handleKeyDown = (e: React.KeyboardEvent) => {
		const filteredOptions = options.filter(option => option.label.toLowerCase().includes((e.target as HTMLInputElement).value.toLowerCase()));
		if (e.code === 'Enter' || e.key === 'Enter')
		{
			setSelected(filteredOptions[0]);
			inputRef.current?.blur();
		}
	}

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const filteredOptions = options.filter(option => option.label.toLowerCase().includes((e.target as HTMLInputElement).value.toLowerCase()));
		if (filteredOptions.length === 1) {
			setSelected(filteredOptions[0]);
		}
	}

	return (
		<Autocomplete
			onKeyDown={handleKeyDown}
			id="combo-box"
			onBlur={handleBlur}
			size={size}
			value={selected}
			options={options}
			sx={{ minWidth: minWidth }}
			renderOption={(props, option) => {
				return (
					<li {...props} key={option.id}>
						{option.label}
					</li>
				);
			}}
			renderInput={(params) => <TextField {...params} label={label} inputRef={inputRef} />}
			onChange={(_, newValue) => {
				if (newValue) {
					setSelected(newValue);
				} else { setSelected({ id: -1, label: '' }); }
			}}
		/>
	)
}