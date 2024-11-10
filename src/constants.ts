export const criteria = [
	{
		name: "Проверка наименования",
		endpoint: "/api/check_title",
	},
	// {
	// 	name: 'Проверка поля "обеспечение исполнения контракта"',
	// 	endpoint: "/api/check_contract_enforced",
	// },
	// { name: "Проверка наличия сертификатов/лицензий" },
	// { name: "Проверка графика поставки и этапа поставки" },
	{
		name: "Проверка внешнего вида товаров",
		endpoint: "/api/check_photo",
	},
	{
		name: "Проверка графика поставки товаров",
		endpoint: "/api/check_delivery_dates",
	},
	// { name: "Проверка начального и максимального значения цены контракта" },
	{
		name: "Проверка значения характеристики спецификации закупки.",
		endpoint: "/api/check_characteristic",
	},
	{
		name: "Проверка количества товаров спецификации закупки.",
		endpoint: "/api/check_quantity",
	},
	// { name: "Проверка количества характеристик." },
];

export const initialChecks = Object.fromEntries(
	criteria.map(({ name }) => [name, true])
);

export interface CheckResponse {
	plausibility?: number;
	message?: string;
	status?: "loading" | "success" | "error" | "empty" | null;
	additional_info?: string[][];
}

export const initialResponses: Record<string, CheckResponse | null> =
	Object.fromEntries(criteria.map(({ name }) => [name, null]));

export const LINK_REGEX =
	/^(https:\/\/|(www\.))?zakupki\.mos\.ru\/auction\/\d+$/;

export const validateLink = (link: string) =>
	LINK_REGEX.test(link) ||
	/^\d+$/.test(link) ||
	"Ввод должен быть ссылкой вида https://zakupki.mos.ru/auction/9869986 или числовым ID сессии";
