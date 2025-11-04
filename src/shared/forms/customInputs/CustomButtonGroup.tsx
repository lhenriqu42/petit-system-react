import { Button, ButtonGroup, ButtonProps } from "@mui/material";
import { useState } from "react";

interface IButtonProps extends ButtonProps {
	label: string;

}

interface ICustomButtonGroupProps {
	width?: string | number;
	variant?: "text" | "outlined" | "contained";
	size?: "small" | "medium" | "large";
	onChange?: (selected: { label: string, index: number } | null) => void;
	buttons: IButtonProps[];
}

export const CustomButtonGroup: React.FC<ICustomButtonGroupProps> = ({
	buttons,
	width = 200,
	size = "medium",
	variant = "contained",
	onChange,
}) => {
	const [selected, setSelected] = useState<{ label: string, index: number } | null>(buttons.length > 0 ? { label: buttons[0].label, index: 0 } : null);
	const handleChange = (selectedParam: { label: string, index: number } | null) => {
		if (selected?.label === selectedParam?.label) return;
		setSelected(selectedParam);
		onChange?.(selectedParam);
	};

	return (
		<ButtonGroup variant={variant} aria-label="outlined button group" sx={{ width }} size={size}>
			{buttons.map((button, index) => (
				<Button {...button} size={size} key={button.label} sx={{ width: `${100 / buttons.length}%` }} onClick={() => handleChange({ label: button.label, index })} variant={selected?.index === index ? 'contained' : 'outlined'}>
					{button.label}
				</Button>
			))}
		</ButtonGroup>
	);
};
