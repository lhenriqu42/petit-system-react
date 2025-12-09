import { useEffect, useId, useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { FormHelperText } from '@mui/material';
import { useDeepEffect } from '../../hooks';

interface IBorderColor {
	normal?: string,
	hover?: string,
	focused?: string,
}

export interface IMenuItens {
	text: string
	value: string
}

interface IVSelectProps {
	menuItens: IMenuItens[],
	label?: string,
	helperText?: string,
	width?: number | string,
	minWidth?: number | string,
	maxWidth?: number | string,
	defaultSelected?: number,
	onValueChange?: (selectedValue: string) => void;
	m?: number,
	mx?: number,
	my?: number,
	mt?: number,
	p?: number,
	px?: number,
	py?: number,
	size?: 'small' | 'medium';
	required?: boolean;
	borderColor?: IBorderColor;
	disabled?: boolean;
}

export const CustomSelect: React.FC<IVSelectProps> = ({ menuItens, label, defaultSelected, helperText, minWidth, onValueChange, m, mx, my, mt, p, px, py, maxWidth, width, size = 'medium', required, disabled }) => {
	const uniqueId = useId();
	const [value, setValue] = useState('');
	const [borderColor, setBorderColor] = useState<IBorderColor>();

	const handleChange = (event: SelectChangeEvent) => {
		setValue(event.target.value as string);
		onValueChange?.(event.target.value);
	};

	useDeepEffect(() => {
		if (defaultSelected !== undefined) {
			if (defaultSelected >= 0 && defaultSelected < menuItens.length) {
				setValue(menuItens[defaultSelected].value);
			}
		}
	}, [defaultSelected, menuItens]);

	useEffect(() => {
		if (required) {
			if (value) {
				if (value === '') setBorderColor({ normal: '#d32f2f', hover: '#d32f2f', focused: '#d32f2f' });
				else setBorderColor(undefined);
			}
			else setBorderColor({ normal: '#d32f2f', hover: '#d32f2f', focused: '#d32f2f' });
		}
	}, [value]);

	return (
		<Box sx={{ minWidth, m, mx, my, mt, p, px, py, maxWidth, width }}>
			<FormControl fullWidth>
				<InputLabel id={`${uniqueId}-label`} size={size == 'small' ? 'small' : 'normal'} color={borderColor && 'error'}>{label}</InputLabel>
				<Select
					disabled={disabled}
					sx={{
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: borderColor?.normal,
						},
						'&:hover .MuiOutlinedInput-notchedOutline': {
							borderColor: borderColor?.hover,
						},
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							borderColor: borderColor?.focused,
						},
					}}
					inputProps={{
						MenuProps: {
							MenuListProps: {
								sx: {
									maxHeight: 250,
									overflowY: 'auto',
									backgroundColor: '#fff',
								}
							}
						}
					}}
					labelId={`${uniqueId}-label`}
					id={`${uniqueId}-select`}
					value={value}
					label={label}
					onChange={handleChange}
					size={size}
				>
					{
						menuItens.map((item) => (
							<MenuItem key={item.value} value={item.value}>
								{item.text}
							</MenuItem>
						))
					}
				</Select>
				<FormHelperText>{helperText}</FormHelperText>
			</FormControl>
		</Box >
	);
}