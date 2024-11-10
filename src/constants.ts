export const criteria = [
	{
		name: "Проверка наименования",
		endpoint: "/api/check_title",
	},
	{
		name: 'Проверка поля "обеспечение исполнения контракта"',
		endpoint: "/api/check_contract_enforced",
	},
	// { name: "Проверка наличия сертификатов/лицензий" },
	// { name: "Проверка графика поставки и этапа поставки" },
	{
		name: "Проверка внешнего вида товаров",
		endpoint: "/api/check_photo",
	},
	// { name: "Проверка начального и максимального значения цены контракта" },
	// {
	// 	name: "Проверка наименования и значения характеристики спецификации закупки.",
	// },
	// { name: "Проверка количества товаров спецификации закупки." },
	// { name: "Проверка количества характеристик." },
];

export const initialChecks = criteria.map(({ name }) => ({
	name,
	enabled: true,
}));

export interface CheckResponse {
	message: string;
	plausibility: number;
}

export const initialResponses: Record<string, CheckResponse | null> =
	Object.fromEntries(criteria.map(({ name }) => [name, null]));
