import { TextField, TextFieldProps } from "@mui/material";
import { useState } from "react";
import { nToBRL } from "../../services/formatters";

type CustomTextFieldProps = TextFieldProps & {
	valueDefault?: string;
	cash?: boolean;
	unsigned?: boolean;
	callBack?: (value: string) => void;
}

export const CustomTextField: React.FC<CustomTextFieldProps> = ({ callBack, valueDefault, cash, unsigned, ...rest }) => {

	const [value, setValue] = useState(valueDefault ? valueDefault : cash ? 'R$ 0,00' : '');

	const handleCashChange = (string: string) => {
		const rawValue = string.replace(/[^0-9]/g, '');
		const numericValue = Number(rawValue) / 100;
		const formattedValue = nToBRL(numericValue);
		return (formattedValue);
	};

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		let value = event.target.value;
		if (unsigned) {
			value = value.replace(/-/g, '');
		}
		if (cash)
			value = handleCashChange(value);
		setValue(value);
		if (callBack)
			callBack(value);
		if (rest.onChange)
			rest.onChange(event);
	}

	return (
		<TextField
			fullWidth
			autoComplete="off"
			value={value || ''}

			{...rest}

			onChange={handleOnChange}
		/>
	);
};