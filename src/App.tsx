import styles from "./App.module.css";
import {
	TextInput,
	Text,
	Icon,
	Button,
	Card,
	Switch,
	Flex,
	Popover,
	Spin,
	Disclosure,
} from "@gravity-ui/uikit";
import {
	Check,
	CircleExclamation,
	Gear,
	CircleQuestion,
	TriangleExclamation,
} from "@gravity-ui/icons";
import {
	CheckResponse,
	criteria,
	initialChecks,
	initialResponses,
	validateLink,
	warnings,
} from "./constants";
import axios from "axios";
import { Field } from "./components/Field";
import { FilePicker } from "./components/FilePicker";
import { FormEventHandler, useCallback, useState } from "react";

const StatusIcon = {
	success: <Icon data={Check} stroke="var(--g-color-line-positive)" />,
	error: <Icon data={CircleExclamation} stroke="var(--g-color-line-danger)" />,
	warning: (
		<Icon data={TriangleExclamation} stroke="var(--g-color-line-warning)" />
	),
	empty: <Icon data={CircleQuestion} />,
	loading: <Spin size="xs" />,
};

export const App: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [link, setLink] = useState("");
	const [checks, setCheks] = useState(initialChecks);
	const [linkError, setLinkError] = useState<string>();
	const [fileError, setFileError] = useState<string>();

	const [responses, setResponses] = useState(initialResponses);

	const submitHandler = useCallback<FormEventHandler>(
		async event => {
			event.preventDefault();

			const checkLink = validateLink(link);
			const checkFile = Boolean(file) || "Загрузите файл";

			if (checkLink !== true) {
				setLinkError(checkLink);
			}

			if (checkFile !== true) {
				setFileError(checkFile);
			}

			if (!(checkFile === true && checkLink === true)) {
				return;
			}

			setLoading(true);
			setResponses(initialResponses);

			const enabledChecks = Object.entries(checks)
				.map(([name, enabled]) => ({ name, enabled }))
				.filter(({ enabled }) => enabled);

			await Promise.all(
				enabledChecks.map(async ({ name }) => {
					try {
						setResponses(prev => ({ ...prev, [name]: { status: "loading" } }));

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

						setResponses(prev => ({
							...prev,
							[name]: {
								...data,
								status: warnings.includes(name)
									? "warning"
									: data
										? data.message?.includes("Требуется")
											? "warning"
											: "success"
										: "empty",
							},
						}));
					} catch (error) {
						setResponses(prev => ({
							...prev,
							[name]: {
								status: "error",
								message:
									error instanceof Error ? error.message : "Неизвестная ошибка",
							},
						}));
					}
				})
			);
			setLoading(false);
		},
		[checks, file, link]
	);

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={submitHandler}>
				<Flex gap={2}>
					<Field label="URL-адрес/ID котировочной сессии" style={{ flex: 1 }}>
						<TextInput
							value={link}
							onUpdate={value => {
								setLink(value);
								setLinkError(undefined);
							}}
							placeholder="https://zakupki.mos.ru/auction/9869986"
							className={styles.textInput}
							disabled={loading}
							error={linkError}
						/>
					</Field>

					<Field>
						<Popover
							openOnHover={false}
							className={styles.popover}
							placement={"bottom-end"}
							disabled={loading}
							content={
								<Flex direction="column" gap={2}>
									{criteria.map(({ name }) => (
										<Switch
											content={name}
											key={name}
											checked={checks[name]}
											onUpdate={checked =>
												setCheks(prev => ({ ...prev, [name]: checked }))
											}
										/>
									))}
								</Flex>
							}
						>
							<Button disabled={loading}>
								<Icon data={Gear} />
							</Button>
						</Popover>
					</Field>
				</Flex>

				<FilePicker
					file={file}
					onChange={f => {
						setFile(f);
						setFileError(undefined);
					}}
					disabled={loading}
					error={fileError}
				/>

				<Button
					type="submit"
					view="action"
					size="l"
					className={styles.submitButton}
					disabled={
						loading || Object.values(checks).every(enabled => enabled === false)
					}
					loading={loading}
				>
					Проверить
				</Button>
			</form>
			<Flex direction="column" gap={2}>
				{Object.entries(responses)
					.filter(([, response]) => response !== null)
					.map(([name, response]) => (
						<Card key={name} style={{ padding: "8px 16px" }}>
							<Flex gap={3} direction="column">
								<Flex alignItems="center" gap={2}>
									{response?.status && StatusIcon[response.status]}
									<Flex justifyContent="space-between" style={{ flex: 1 }}>
										<Text>{name}</Text>
									</Flex>
								</Flex>
								{response?.message && (
									<Text variant="caption-2">{response.message}</Text>
								)}
								{response?.additional_info &&
									response.additional_info.length > 0 && (
										<Disclosure
											summary={<Text variant="caption-2">Подробнее</Text>}
										>
											<ol>
												{response.additional_info.map(item => (
													<li>
														<Text variant="caption-1">{item.join(" • ")}</Text>
													</li>
												))}
											</ol>
										</Disclosure>
									)}
							</Flex>
						</Card>
					))}
			</Flex>
		</div>
	);
};
