import styles from "./App.module.css";
import {
	Label,
	TextInput,
	Text,
	Icon,
	Button,
	Card,
	Switch,
	Loader,
	Flex,
} from "@gravity-ui/uikit";
import { Check } from "@gravity-ui/icons";
import {
	CheckResponse,
	criteria,
	initialChecks,
	initialResponses,
} from "./constants";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import axios from "axios";

interface LocalCheckResponse {
	plausibility?: number;
	message?: string;
	status?: "loading" | "success" | "error" | "empty";
}

interface Form {
	link: string;
	checks: Array<{
		name: string;
		enabled: boolean;
	}>;
}

export const App: React.FC = () => {
	const inputFileRef = useRef<HTMLInputElement | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	const { handleSubmit, register } = useForm<Form>({
		defaultValues: {
			checks: initialChecks,
			link: "",
		},
	});

	const [responses, setResponses] = useState<
		Record<string, LocalCheckResponse>
	>(initialResponses as Record<string, LocalCheckResponse>);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0] ?? null;

		if (inputFileRef.current) {
			inputFileRef.current.value = "";
		}

		setFile(selectedFile);
	};

	const submitHandler = handleSubmit(async ({ checks, link }) => {
		setLoading(true);

		setResponses(initialResponses as Record<string, LocalCheckResponse>);

		const enabledChecks = checks.filter(({ enabled }) => enabled);

		Promise.all(
			enabledChecks.map(async ({ name }) => {
				const formData = new FormData();
				if (file) {
					formData.set("file", file);
				}

				setResponses(prev => ({
					...prev,
					[name]: { status: "loading" } as LocalCheckResponse,
				}));

				try {
					const { data } = await axios.post<CheckResponse>(
						`${import.meta.env.VITE_API_URL}${criteria.find(c => c.name === name)?.endpoint}`,
						formData,
						{
							params: {
								id: link.slice(link.lastIndexOf("/") + 1),
							},
						}
					);
					return {
						name,
						data: { ...data, status: "success" } as LocalCheckResponse,
					};
				} catch (error) {
					return { name, data: { status: "error" } as LocalCheckResponse };
				}
			})
		).then(results => {
			setResponses(prev => ({
				...prev,
				...Object.fromEntries(
					results.map(({ name, data }) => [name, data as LocalCheckResponse])
				),
			}));
			setLoading(false);
		});
	});

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={submitHandler}>
				<TextInput
					{...register("link")}
					label="URL-адрес/ID котировочной сессии"
					placeholder="Введите URL или ID сессии"
					className={styles.textInput}
				/>
				<div className={styles.fileField}>
					<Button
						onClick={() => inputFileRef.current?.click()}
						view="normal"
						className={styles.uploadButton}
					>
						{file ? "Изменить файл" : "Загрузить файл"}
					</Button>
					<input
						ref={inputFileRef}
						type="file"
						accept=".doc,.docx"
						onChange={handleFileChange}
						hidden
					/>
					{file && (
						<div style={{ display: "flex", alignItems: "center" }}>
							<Text>{file.name}</Text>
							<Button
								view="flat"
								onClick={() => setFile(null)}
								title="Удалить файл"
								style={{ color: "red", marginLeft: "8px" }}
							>
								&times;
							</Button>
						</div>
					)}
				</div>
				<Card className={styles.checkboxes}>
					{criteria.map(({ name }, index) => (
						<Switch
							{...register(`checks.${index}.enabled`)}
							content={name}
							defaultChecked
							key={name}
							className={styles.switch}
						/>
					))}
				</Card>
				<Button
					type="submit"
					view="action"
					size="l"
					className={styles.submitButton}
					disabled={loading}
				>
					Проверить
					{loading && <Loader size="s" />}
				</Button>
			</form>
			<div className={styles.checkResults}>
				{Object.entries(responses).map(([name, response]) => (
					<Card
						key={name}
						className={`${styles.checkResult} ${
							response?.status === "success"
								? styles.success
								: response?.status === "error"
									? styles.error
									: response?.status === "empty"
										? styles.warning
										: styles.neutral
						}`}
					>
						<Flex justifyContent="space-between" alignItems="center">
							{response?.status === "loading" ? (
								<span title="Проверка выполняется">...</span>
							) : response?.status === "success" && response?.message ? (
								<span title="Успешно" style={{ color: "green" }}>
									<Icon data={Check} />
								</span>
							) : response?.status === "error" ? (
								<span
									title="Ошибка проверки"
									style={{ color: "red", fontWeight: "bold" }}
								>
									❗
								</span>
							) : response?.status === "empty" ? (
								<span
									title="Нет данных"
									style={{ color: "yellow", fontWeight: "bold" }}
								>
									❓
								</span>
							) : response && !response?.message ? (
								<span
									title="Пустой ответ"
									style={{ color: "gray", fontWeight: "bold" }}
								>
									⚠
								</span>
							) : (
								<span
									title="Ожидание проверки"
									style={{ color: "gray", fontWeight: "bold" }}
								>
									...
								</span>
							)}
							<Text>{name}</Text>
							{response?.plausibility !== undefined && (
								<Label>
									{response.status === "error"
										? "Ошибка"
										: response.status === "empty"
											? "Нет данных"
											: `${response.plausibility}%`}
								</Label>
							)}
						</Flex>
					</Card>
				))}
			</div>
		</div>
	);
};
