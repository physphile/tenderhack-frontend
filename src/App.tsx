import styles from "./App.module.css";
import {
	Label,
	TextInput,
	Text,
	Icon,
	Button,
	Card,
	Flex,
	Switch,
} from "@gravity-ui/uikit";
import { Check, Xmark } from "@gravity-ui/icons";
import {
	CheckResponse,
	criteria,
	initialChecks,
	initialResponses,
} from "./constants";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import axios from "axios";

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

	const { handleSubmit, register } = useForm<Form>({
		defaultValues: {
			checks: initialChecks,
			link: "",
		},
	});

	const [responses, setResponses] = useState(initialResponses);

	const submitHandler = handleSubmit(async ({ checks, link }) => {
		checks
			.filter(({ enabled }) => enabled)
			.forEach(async ({ name }) => {
				const formData = new FormData();
				if (file) {
					formData.set("file", file);
				}

				const { data } = await axios.post<CheckResponse>(
					`${import.meta.env.VITE_API_URL}${criteria.find(c => c.name === name)?.endpoint}`,
					formData,
					{
						params: {
							id: link.slice(link.lastIndexOf("/") + 1),
						},
					}
				);
				setResponses(prev => ({ ...prev, [name]: data }));
			});
	});

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={submitHandler}>
				<TextInput
					{...register("link")}
					label="URL-адрес/ID котировочной сессии"
				/>
				<div className={styles.fileField}>
					{file && (
						<Button
							onClick={() => {
								setFile(null);
								if (inputFileRef.current) {
									inputFileRef.current.value = "";
								}
							}}
						>
							<Icon data={Xmark} />
						</Button>
					)}
					<label htmlFor="inputFile" className={styles.filePicker}>
						<input
							ref={inputFileRef}
							id="inputFile"
							type="file"
							accept=".doc,.docx"
							onChange={event => setFile(event.target.files?.[0] ?? null)}
							hidden
						/>
						{!file && (
							<Label className={styles.inputFileLabel} size="m">
								Загрузить файл
							</Label>
						)}
						<Text ellipsis>{file?.name}</Text>
					</label>
				</div>
				<Card className={styles.checkboxes}>
					{criteria.map(({ name }, index) => (
						<Switch
							{...register(`checks.${index}.enabled`)}
							content={name}
							defaultChecked
							key={name}
						/>
					))}
				</Card>

				<Button type="submit" view="action" size="l">
					Проверить
				</Button>
			</form>
			<div className={styles.checks}>
				{Object.entries(responses).map(([name, response]) => (
					<Card className={styles.check} key={name}>
						<div className={styles.checkStatus}>
							{response === null ? null : response.plausibility > 50 ? (
								<Icon data={Check} stroke="green" />
							) : (
								<Icon data={Xmark} stroke="red" />
							)}
						</div>
						<Flex justifyContent="space-between" style={{ flex: 1 }}>
							<div className={styles.checkName}>{name}</div>
							{response?.plausibility && (
								<Label>{response.plausibility}%</Label>
							)}
						</Flex>
					</Card>
				))}
			</div>
		</div>
	);
};
