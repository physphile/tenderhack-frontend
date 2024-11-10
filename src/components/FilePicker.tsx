import { Xmark } from "@gravity-ui/icons";
import { Button, Flex, Icon, Text } from "@gravity-ui/uikit";
import { useRef } from "react";

interface Props {
	onChange?: (file: File | null) => void;
	file?: File | null;
	disabled?: boolean;
	error?: string;
}

export const FilePicker: React.FC<Props> = ({
	onChange,
	file,
	disabled = false,
	error,
}) => {
	const inputFileRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] ?? null;

		onChange?.(selectedFile);
	};

	const clearFile = () => {
		onChange?.(null);
		if (inputFileRef.current) {
			inputFileRef.current.value = "";
		}
	};

	return (
		<Flex gap={1} direction={"column"}>
			<Flex gap={2}>
				<Button
					onClick={() => inputFileRef.current?.click()}
					style={{ width: "150px" }}
					disabled={disabled}
				>
					{file ? "Изменить файл" : "Загрузить файл"}
				</Button>
				<input
					ref={inputFileRef}
					type="file"
					accept=".doc,.docx"
					onChange={handleFileChange}
					hidden
					disabled={disabled}
				/>
				{file && (
					<Flex gap={1} alignItems={"center"}>
						<Text color={disabled ? "secondary" : "primary"}>{file.name}</Text>
						<Button onClick={clearFile} size="xs" disabled={disabled}>
							<Icon data={Xmark} />
						</Button>
					</Flex>
				)}
			</Flex>
			{error && (
				<div className="g-outer-additional-content__error">{error}</div>
			)}
		</Flex>
	);
};
