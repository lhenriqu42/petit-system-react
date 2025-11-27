import { Autocomplete, TextField, AutocompleteProps } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDeepEffect } from "../../hooks";

type OrigProps = Omit<AutocompleteProps<{ id: number; label: string }, false, false, false>, 'options' | 'renderInput'>
interface IAutoCompleteProps extends OrigProps {
	options: { id: number; label: string }[];
	label?: string;
	size?: 'small' | 'medium';
	minWidth?: number;
	callback?: (selected: { id: number; label: string }) => void;
}

export const CustomAutoComplete: React.FC<IAutoCompleteProps> = ({ options, label, minWidth, callback, ...autoProps }) => {
	const [selected, setSelected] = useState<{ id: number; label: string }>({ id: -1, label: '' });

	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		const filteredOptions = options.filter(option => option.label.toLowerCase().includes((e.target as HTMLInputElement).value.toLowerCase()));
		if (e.code === 'Enter' || e.key === 'Enter') {
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

	useEffect(() => {
		callback?.(selected);
	}, [selected]);

	useDeepEffect(() => {
		setSelected({ id: -1, label: '' });
	}, [options]);

	return (
		<Autocomplete
			onKeyDown={handleKeyDown}
			id="combo-box"
			onBlur={handleBlur}
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
			{...autoProps}
		/>
	)
}