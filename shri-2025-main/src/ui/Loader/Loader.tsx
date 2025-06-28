import styles from './Loader.module.css';

export const Loader = ({ size = 60, ...props }: { size?: number } & React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={styles.loader} style={{ width: size, height: size }} data-testid="loader" {...props} />;
};
