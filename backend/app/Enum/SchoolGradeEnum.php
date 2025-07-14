<?php

namespace App\Enum;

use Filament\Support\Contracts\HasLabel;

enum SchoolGradeEnum: string implements HasLabel
{
    case FUNDAMENTAL = 'fundamental';
    case MEDIO = 'medio';
    case SUPERIOR = 'superior';

    public function getLabel(): string
    {
        return match ($this) {
            self::FUNDAMENTAL => 'Ensino Fundamental',
            self::MEDIO => 'Ensino Médio',
            self::SUPERIOR => 'Ensino Superior',
        };
    }

    public static function getValues(): array
    {
        return [
            self::FUNDAMENTAL->value => 'Ensino Fundamental',
            self::MEDIO->value => 'Ensino Médio',
            self::SUPERIOR->value => 'Ensino Superior',
        ];
    }
}
