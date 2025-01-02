interface LinkCardProps {
    href: string | null;
}

export const LinkCard = ({ href }: LinkCardProps) => {
    return(
        <div>
            {href}
        </div>
    )
}