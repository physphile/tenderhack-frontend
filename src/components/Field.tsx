import { Flex, Text } from "@gravity-ui/uikit";
import { CSSProperties, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
	label?: string;
	style?: CSSProperties;
}

export const Field: React.FC<Props> = ({ label, children, style }) => {
	return (
		<Flex direction={"column"} gap={1} style={style}>
			<label>
				<Text variant="caption-2">{label ?? <span>&nbsp;</span>}</Text>
			</label>
			{children}
		</Flex>
	);
};
